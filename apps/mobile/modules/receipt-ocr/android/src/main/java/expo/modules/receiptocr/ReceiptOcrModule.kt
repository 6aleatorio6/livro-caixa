package expo.modules.receiptocr

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.FileNotFoundException
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

// A página do PDF é desenhada com 3 pixels por ponto (216 dpi): o texto de 10 pt fica com uns 30 px de altura, acima
// dos 16 px por caractere que o ML Kit pede. Uma folha A4 sai com uns 1800 × 2500 px.
private const val PDF_PIXELS_PER_POINT = 3f

// O teto do bitmap da página, uns 48 MB em ARGB_8888: a página muito comprida desce de escala até caber nele, em vez
// de encolher pelo lado maior e deixar o texto miúdo demais.
private const val PDF_PAGE_MAX_PIXELS = 12_000_000f

/** Lê o texto de um comprovante no próprio celular, com o ML Kit: a imagem, ou a primeira página do PDF desenhada. */
class ReceiptOcrModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ReceiptOcr")

    // Devolve as linhas lidas, cada uma com a posição em pixels na imagem lida; o PDF sem páginas não tem nenhuma.
    AsyncFunction("recognizeText") { uri: String, isPdf: Boolean, promise: Promise ->
      val pageBitmap = if (isPdf) renderFirstPdfPage(uri) else null
      val image = if (isPdf) {
        pageBitmap?.let { InputImage.fromBitmap(it, 0) }
      } else {
        InputImage.fromFilePath(context, Uri.parse(uri))
      }
      if (image == null) {
        promise.resolve(emptyList<Any?>())
        return@AsyncFunction
      }

      val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
      recognizer.process(image)
        .addOnSuccessListener { text -> promise.resolve(linesOf(text)) }
        .addOnFailureListener { error -> promise.reject(CodedException("ERR_RECEIPT_OCR", error.message, error)) }
        // A tarefa cancelada não chama nenhum dos dois de cima: sem isto, a promessa não termina e o anexo fica preso
        // embaixo do carregamento.
        .addOnCanceledListener { promise.resolve(emptyList<Any?>()) }
        .addOnCompleteListener {
          recognizer.close()
          // A página desenhada pesa dezenas de MB: sai da memória sem esperar o coletor.
          pageBitmap?.recycle()
        }
    }
  }

  private fun renderFirstPdfPage(uri: String): Bitmap? {
    // O `contentResolver` abre tanto o `content://` do compartilhamento quanto o `file://` do seletor.
    val descriptor = context.contentResolver.openFileDescriptor(Uri.parse(uri), "r")
      ?: throw FileNotFoundException(uri)
    return descriptor.use {
      PdfRenderer(descriptor).use { renderer ->
        if (renderer.pageCount == 0) return null
        renderer.openPage(0).use { page ->
          val scale = min(PDF_PIXELS_PER_POINT, sqrt(PDF_PAGE_MAX_PIXELS / (page.width.toFloat() * page.height)))
          val bitmap = Bitmap.createBitmap(
            (page.width * scale).roundToInt(),
            (page.height * scale).roundToInt(),
            Bitmap.Config.ARGB_8888,
          )
          // O fundo transparente da página chegaria preto ao ML Kit, sem contraste com o texto.
          bitmap.eraseColor(Color.WHITE)
          page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
          bitmap
        }
      }
    }
  }

  private fun linesOf(text: Text): List<Map<String, Any>> =
    text.textBlocks.flatMap { block -> block.lines }.map { line ->
      val box = line.boundingBox
      mapOf(
        "text" to line.text,
        "left" to (box?.left ?: 0),
        "top" to (box?.top ?: 0),
        "width" to (box?.width() ?: 0),
        "height" to (box?.height() ?: 0),
      )
    }
}
