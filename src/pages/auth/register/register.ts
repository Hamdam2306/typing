import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

interface RegisterData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  age: number;
  role: string;
}

export const RegisterUser = async (data: RegisterData) => {
  const { email, password, firstname, lastname, phone, age, role } = data;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await setDoc(doc(db, "users", uid), {
    firstname,
    lastname,
    email,
    phone,
    age,
    role,
    createdAt: serverTimestamp()
  });

  return userCredential.user;
};
