import type{ User } from "firebase/auth";

export const printUserInfo = (user: User) => {
  console.log("🔐 Firebase foydalanuvchi ma'lumotlari:");
  console.log("UID:           ", user.uid);
  console.log("Email:         ", user.email);
  console.log("Email tasdiqlanganmi:", user.emailVerified);
  console.log("Display Name:  ", user.displayName);
  console.log("Photo URL:     ", user.photoURL);
  console.log("Phone Number:  ", user.phoneNumber);
  console.log("Provider ID:   ", user.providerId);
  console.log("Is Anonymous:  ", user.isAnonymous);
  console.log("Tenant ID:     ", user.tenantId);


  console.log("Yaratilgan vaqti:", user.metadata.creationTime);
  console.log("Oxirgi kirgan vaqti:", user.metadata.lastSignInTime);


  console.log("➡️ ProviderData:");
  user.providerData.forEach((provider, index) => {
    console.log(`  [${index}] Provider ID: ${provider.providerId}`);
    console.log(`      UID: ${provider.uid}`);
    console.log(`      Display Name: ${provider.displayName}`);
    console.log(`      Email: ${provider.email}`);
    console.log(`      Photo URL: ${provider.photoURL}`);
    console.log(`      Phone Number: ${provider.phoneNumber}`);
  });

  };
