const register = async (req, res) => {
  try {
    const { prenom, nom, email, telephone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { telephone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email ou téléphone déjà utilisé" });
    }

    const user = await User.create({ prenom, nom, email, telephone, password });

    // ✅ Email non-bloquant - ne plante plus l'inscription
    sendMail({
      to: user.email,
      subject: "Bienvenue sur Bakéli Tontine 🎉",
      html: welcomeTemplate(`${user.prenom} ${user.nom}`),
    }).catch((err) => console.error("Erreur envoi email:", err));

    res.status(201).json({
      token: generateJWT(user._id),
      user: {
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        avatar: user.avatar,
        statut: user.statut,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};