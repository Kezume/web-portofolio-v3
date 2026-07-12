import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Prevent duplicate app initialization (hot reload safe)
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: "web-portofolio-cc002",
        clientEmail: "firebase-adminsdk-fbsvc@web-portofolio-cc002.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD2XmPTT3DXXpll\n+ot4ONzOgJEpEBSN6nmbep7Ns5p+p9/tzWZhmPzAu2L0n+qf9094w7exPTRL19Eq\nUH4bpbh2Vsr29dfLpwb03Gf6/obLFeYZIBKvI75Aznl1pA7zefYCqRCTN2VK0Efi\nRLgIdFQmYGITmNx48AjL2TQ11gwoCBGdYR8hHbtL2jktUGtzat/WfXdRyjQhQLpn\nGNoe3TlkkKNSzBXi1EgE+L+AIDM/7X5WQ9IkvFL6iOckBw98Fvm3jj4DlpeOkAbO\nN8HXMR81BAdwFF9Mo3BQa+2vhn1JsnYpYc0zLLWeShKFHsx7qRVGoQ7hqK9auM4M\neTiTNKdzAgMBAAECggEADsJl3EAV7wPEUIHbfswinPPCfoFvnHblFSWZ7jx/Ghey\n3cYLMaKe1b8EH8qVcu2NIxt6iDw17gCTuni7AqtWwIQqQZ7wcCC6qnWqfF9o3Nwc\nKPotFF/2+F6bk9V3GIAAdyAAwF5hC5ksYpz3oiNcnTXzT4roqQ1xlstq33ofcqW3\nAkd/oa0CWSMBqfd0C2uq2rsM29o1eIvVYBh6OHgweXCTj6BHJA6cJ6FUJ+x08UTH\no4as2f21UCJNsxBPrV1NY7sVR1H0yyUmSGUJP2Zn7NQLaU/Pq8KXFRNE7/66o49x\nNLA1rHfRQ4CP8LoRL8EPSMmUq4MEENSPV/b6dAF8eQKBgQD9TToVxSbmEYA+I24m\nMiIlOJgu1+I7kFgjnzsggNS5/Gu/m/fp5NlIQou4FuMBF55vZUUkjW3g/Lnw3Vwh\nLzNLs4LoVaCuHWT/jYn2I8LC2gyEIUw1sORN/4HqOtwhuXML3oOZpD8FFwzg786x\nUpqxboi3O3r1BOMfnBo3Tshm+wKBgQD4/kGfqe12ukTCTWqOWz42mNwEtBXEKIqS\nEadNjogPrA+nozwZihYnRJ3hXr6qkt6ZYZS1ZM1ozBKAhCdpE/qX1WSWPMNGH08J\nSC2g/GJEGygCPF59jaVHvjR22UkQs6ioei28q3dqvVj8KaaHNt0Btj3TimwiK82F\nBbAfnt036QKBgGRIIMjhpsbLAvSW3lLs4ivOPiG9gmmGef6QWb5CgvWnA5l2TC4j\nVgqPnfUhynlyOl1rwHX6MBg0tgCwAnt4zlwYE6mbzONh68xo4se53K972ByvehZ/\nk8N1dp+e8evAGdYHIB7Bsdl4CLc8+Z2mUGwSkLnKKKG8b5biHFbtL9XlAoGBANS0\nz/bHwZZ1lZuvauHlzIXzm7Fg7l8+ivIxpoy4wD8zK8R3zDW9IyO0mHMY7yTkhsjc\n9Z7oWBm4i+3B97DqYl8m6uD1U5Qp1ukFAgXO1Vt9H3aZf9ceFB3vvP3yrVpZQDF8\n/ml4yXEkBEqWgi5sjeySdMqsK6gdZ1rF+yloG29RAoGBALGuDwdbxVvlg7pdPxuu\n3NQZZ1mmK4hjls6e0ngPKta5YGyoElMrkmr2UXxuBF0Mw67Edeti4M6d8JYCTUDf\nkmeKACxBP/oEILNXRkOlyxZJN14U+sAZIJA+EtWLg3tG5NyRHB9UYNR10lMQi56C\nAreaYTvACFlhQizRCl1PKegZ\n-----END PRIVATE KEY-----\n"
      }),
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Only getFirestore if an app was initialized to prevent crashing on import
export const db = getApps().length > 0 ? getFirestore() : null as any;
