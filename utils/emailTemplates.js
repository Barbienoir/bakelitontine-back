const welcomeTemplate = (prenom) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:12px;">
    <div style="background:#22c55e;padding:16px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Bakéli Tontine</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;">
      <h2 style="color:#0f2137;">Bienvenue, ${prenom} !</h2>
      <p style="color:#555;">Votre compte a été créé avec succès sur Bakéli Tontine.</p>
      <p style="color:#555;">Vous pouvez maintenant vous connecter et gérer vos cotisations.</p>
      <div style="margin:24px 0;">
        <a href="${process.env.CLIENT_URL}/login"
          style="background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Se connecter
        </a>
      </div>
      <p style="color:#aaa;font-size:12px;">Bakéli Tontine &copy; 2024</p>
    </div>
  </div>
`;

const cotisationValideTemplate = (prenom, cotisation) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:12px;">
    <div style="background:#22c55e;padding:16px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Bakéli Tontine</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;">
      <h2 style="color:#0f2137;">Cotisation validée ✅</h2>
      <p style="color:#555;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="color:#555;">Votre cotisation du mois de <strong>${cotisation.mois}</strong> a été validée.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f3f4f6;">
          <td style="padding:10px;border:1px solid #e5e7eb;color:#555;">Mois</td>
          <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">${cotisation.mois}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #e5e7eb;color:#555;">Montant</td>
          <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">${cotisation.montant.toLocaleString("fr")} FCFA</td>
        </tr>
        <tr style="background:#f3f4f6;">
          <td style="padding:10px;border:1px solid #e5e7eb;color:#555;">Date</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${new Date(cotisation.date).toLocaleDateString("fr")}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #e5e7eb;color:#555;">Statut</td>
          <td style="padding:10px;border:1px solid #e5e7eb;color:#22c55e;font-weight:bold;">Validé</td>
        </tr>
      </table>
      <p style="color:#aaa;font-size:12px;">Bakéli Tontine &copy; 2024</p>
    </div>
  </div>
`;

const cotisationRejeteTemplate = (prenom, cotisation) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:12px;">
    <div style="background:#ef4444;padding:16px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Bakéli Tontine</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;">
      <h2 style="color:#0f2137;">Cotisation rejetée ❌</h2>
      <p style="color:#555;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="color:#555;">Votre cotisation du mois de <strong>${cotisation.mois}</strong> a été rejetée.</p>
      <p style="color:#555;">Veuillez contacter l'administrateur pour plus d'informations.</p>
      <p style="color:#aaa;font-size:12px;">Bakéli Tontine &copy; 2024</p>
    </div>
  </div>
`;

const factureTemplate = (prenom, cotisation, payment) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:12px;">
    <div style="background:#0f2137;padding:16px 24px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Bakéli Tontine</h1>
      <span style="color:#22c55e;font-weight:bold;font-size:14px;">FACTURE</span>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
        <div>
          <h2 style="color:#0f2137;margin:0 0 4px;">Reçu de paiement</h2>
          <p style="color:#aaa;margin:0;font-size:13px;">N° ${payment._id}</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#555;margin:0;font-size:13px;">${new Date().toLocaleDateString("fr")}</p>
        </div>
      </div>
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin-bottom:16px;">
        <p style="margin:0;color:#555;font-size:13px;">Membre</p>
        <p style="margin:4px 0 0;color:#0f2137;font-weight:bold;">${prenom}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#0f2137;">
            <th style="padding:10px;color:#fff;text-align:left;">Description</th>
            <th style="padding:10px;color:#fff;text-align:right;">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px;border:1px solid #e5e7eb;">Cotisation — ${cotisation.mois}</td>
            <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;font-weight:bold;">
              ${cotisation.montant.toLocaleString("fr")} FCFA
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#f3f4f6;">
            <td style="padding:12px;font-weight:bold;color:#0f2137;">Total</td>
            <td style="padding:12px;font-weight:bold;color:#22c55e;text-align:right;">
              ${cotisation.montant.toLocaleString("fr")} FCFA
            </td>
          </tr>
        </tfoot>
      </table>
      <div style="margin:16px 0;">
        <p style="color:#555;font-size:13px;">
          <strong>Moyen de paiement :</strong> ${payment.provider === "stripe" ? "Carte bancaire" : payment.provider === "wave" ? "Wave CI" : "Manuel"}
        </p>
        <p style="color:#555;font-size:13px;">
          <strong>Statut :</strong> <span style="color:#22c55e;">Payé</span>
        </p>
        ${payment.transactionId ? `<p style="color:#555;font-size:13px;"><strong>Transaction :</strong> ${payment.transactionId}</p>` : ""}
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;margin-top:16px;">
        <p style="margin:0;color:#166534;font-size:13px;">✅ Paiement confirmé et enregistré avec succès.</p>
      </div>
      <p style="color:#aaa;font-size:11px;margin-top:24px;text-align:center;">
        Bakéli Tontine &copy; 2024 — Ce document est une preuve de paiement officielle.
      </p>
    </div>
  </div>
`;

const resetPasswordTemplate = (prenom, resetUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:12px;">
    <div style="background:#0f2137;padding:16px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Bakéli Tontine</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;">
      <h2 style="color:#0f2137;">Réinitialisation du mot de passe</h2>
      <p style="color:#555;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="color:#555;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.</p>
      <p style="color:#555;">Ce lien est valable <strong>1 heure</strong>.</p>
      <div style="margin:24px 0;">
        <a href="${resetUrl}"
          style="background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Réinitialiser le mot de passe
        </a>
      </div>
      <p style="color:#aaa;font-size:12px;">Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
      <p style="color:#aaa;font-size:12px;">Bakéli Tontine &copy; 2024</p>
    </div>
  </div>
`;

module.exports = {
  welcomeTemplate,
  cotisationValideTemplate,
  cotisationRejeteTemplate,
  factureTemplate,
  resetPasswordTemplate,
};
