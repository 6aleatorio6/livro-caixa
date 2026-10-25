import { collection, doc } from 'firebase/firestore';

export const entryOf = (firestore, email) => doc(firestore, 'allowedEmails', email);

export const tagsDocOf = (firestore) => doc(firestore, 'settings', 'tags');

export const settingsDocOf = (firestore, id) => doc(firestore, 'settings', id);

export const recurringBillOf = (firestore, id) => doc(firestore, 'recurringBills', id);

export const entryDocOf = (firestore, id) => doc(firestore, 'entries', id);

export const entriesOf = (firestore) => collection(firestore, 'entries');

export const fileOf = (firestore, id) => doc(firestore, 'files', id);

export const recurringBillsOf = (firestore) => collection(firestore, 'recurringBills');
