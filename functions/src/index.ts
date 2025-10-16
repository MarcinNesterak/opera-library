import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Interfejsy
interface LoanNotificationData {
  musicianEmail: string;
  musicianName: string;
  scoreTitle: string;
  scoreComposer: string;
  scorePart: string;
  type: "loan" | "return" | "reminder";
}

// Funkcja do wysyłania powiadomień o wypożyczeniach
export const sendLoanNotification = functions.https.onCall(
  async (data: LoanNotificationData, context) => {
    // Sprawdź czy użytkownik jest zalogowany
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Użytkownik musi być zalogowany"
      );
    }

    const {musicianEmail, musicianName, scoreTitle, scoreComposer, scorePart, type} = data;

    // Tutaj normalnie użyłbyś SendGrid/Resend do wysyłania emaili
    // Na razie logujemy w konsoli
    console.log("📧 Wysyłanie emaila:", {
      to: musicianEmail,
      name: musicianName,
      score: `${scoreTitle} - ${scoreComposer} (${scorePart})`,
      type: type,
    });

    // TODO: Integracja z SendGrid/Resend
    // Przykładowy kod SendGrid (odkomentuj gdy skonfigurujesz):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    let subject = '';
    let text = '';
    
    if (type === 'loan') {
      subject = 'Potwierdzenie wypożyczenia nut';
      text = `Witaj ${musicianName},\n\nPotwierdzamy wypożyczenie:\n${scoreTitle} - ${scoreComposer}\nGłos: ${scorePart}\n\nPamiętaj o zwrocie nut po zakończeniu użytkowania.\n\nPozdrawiamy,\nBiblioteka Operowa`;
    } else if (type === 'return') {
      subject = 'Potwierdzenie zwrotu nut';
      text = `Witaj ${musicianName},\n\nPotwierdzamy zwrot:\n${scoreTitle} - ${scoreComposer}\nGłos: ${scorePart}\n\nDziękujemy!\n\nPozdrawiamy,\nBiblioteka Operowa`;
    } else if (type === 'reminder') {
      subject = 'Przypomnienie o zwrocie nut';
      text = `Witaj ${musicianName},\n\nPrzypominamy o zwrocie wypożyczonych nut:\n${scoreTitle} - ${scoreComposer}\nGłos: ${scorePart}\n\nProsimy o zwrot nut, gdy tylko będzie to możliwe.\n\nPozdrawiamy,\nBiblioteka Operowa`;
    }
    
    const msg = {
      to: musicianEmail,
      from: 'biblioteka@twoja-opera.pl', // Zmień na swój email
      subject: subject,
      text: text,
    };
    
    await sgMail.send(msg);
    */

    return {success: true, message: "Email wysłany (symulacja)"};
  }
);

// Funkcja schedulera - uruchamiana codziennie o 8:00
export const sendDailyReminders = functions.pubsub
  .schedule("0 8 * * *")
  .timeZone("Europe/Warsaw")
  .onRun(async (context) => {
    console.log("🔔 Rozpoczynam wysyłanie codziennych przypomnień...");

    try {
      // Pobierz ustawienia
      const settingsDoc = await admin
        .firestore()
        .collection("settings")
        .doc("app")
        .get();

      if (!settingsDoc.exists) {
        console.log("Brak ustawień aplikacji");
        return null;
      }

      const settings = settingsDoc.data();
      if (!settings?.emailEnabled) {
        console.log("Powiadomienia email są wyłączone");
        return null;
      }

      const reminderIntervalDays = settings.reminderIntervalDays || 7;

      // Pobierz aktywne wypożyczenia
      const loansSnapshot = await admin
        .firestore()
        .collection("loans")
        .where("status", "==", "active")
        .get();

      console.log(`Znaleziono ${loansSnapshot.size} aktywnych wypożyczeń`);

      // Dla każdego wypożyczenia sprawdź czy należy wysłać przypomnienie
      const now = new Date();
      const promises: Promise<any>[] = [];

      for (const loanDoc of loansSnapshot.docs) {
        const loan = loanDoc.data();
        const loanDate = loan.loanDate.toDate();
        const daysSinceLoan = Math.floor(
          (now.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Sprawdź czy należy wysłać przypomnienie
        // (co X dni, począwszy od X-tego dnia)
        if (
          daysSinceLoan >= reminderIntervalDays &&
          daysSinceLoan % reminderIntervalDays === 0
        ) {
          console.log(
            `Wysyłam przypomnienie dla wypożyczenia ${loanDoc.id} (${daysSinceLoan} dni)`
          );

          // Pobierz dane muzyka i nut
          const musicianDoc = await admin
            .firestore()
            .collection("musicians")
            .doc(loan.musicianId)
            .get();
          const scoreDoc = await admin
            .firestore()
            .collection("scores")
            .doc(loan.scoreId)
            .get();

          if (musicianDoc.exists && scoreDoc.exists) {
            const musician = musicianDoc.data();
            const score = scoreDoc.data();

            // TODO: Tutaj wyślij prawdziwy email
            console.log("📧 Przypomnienie dla:", {
              email: musician?.email,
              name: `${musician?.firstName} ${musician?.lastName}`,
              score: `${score?.title} - ${score?.composer} (${score?.part})`,
            });

            // Zaznacz w bazie, że wysłano przypomnienie (opcjonalnie)
            promises.push(
              admin
                .firestore()
                .collection("loans")
                .doc(loanDoc.id)
                .update({
                  lastReminderSent: admin.firestore.FieldValue.serverTimestamp(),
                })
            );
          }
        }
      }

      await Promise.all(promises);
      console.log("✅ Zakończono wysyłanie przypomnień");
    } catch (error) {
      console.error("❌ Błąd wysyłania przypomnień:", error);
    }

    return null;
  });

