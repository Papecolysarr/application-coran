let utilisateurActuel = null;
let groupes = [];
let lecturesActives = [];
let notifications = [];

// Fonctions d'authentification
function envoyerCode() {
    const phoneNumber = document.getElementById('phone-number').value;
    if (phoneNumber) {
        // Simuler l'envoi d'un code
        const code = Math.floor(1000 + Math.random() * 9000);
        alert(`Code de vérification : ${code}`);
        document.getElementById('verification-code').style.display = 'block';
        document.getElementById('password').style.display = 'block';
        document.getElementById('auth-button').style.display = 'block';
    }
}

function authentifier() {
    const phoneNumber = document.getElementById('phone-number').value;
    const password = document.getElementById('password').value;
    // Vérification simplifiée, à améliorer dans une vraie application
    utilisateurActuel = { id: Date.now(), phoneNumber, name: phoneNumber };
    localStorage.setItem('utilisateurActuel', JSON.stringify(utilisateurActuel));
    mettreAJourInterface();
}

// Fonctions de gestion des groupes
function creerGroupe() {
    const nom = document.getElementById('new-group-name').value;
    if (nom) {
        const groupe = {
            id: Date.now(),
            nom: nom,
            createur: utilisateurActuel.id,
            membres: [utilisateurActuel.id],
            admins: [utilisateurActuel.id],
            demandes: []
        };
        groupes.push(groupe);
        sauvegarderGroupes();
        afficherGroupes();
    }
}

function demanderRejoindreGroupe(groupeId) {
    const groupe = groupes.find(g => g.id === groupeId);
    if (groupe && !groupe.membres.includes(utilisateurActuel.id)) {
        groupe.demandes.push(utilisateurActuel.id);
        sauvegarderGroupes();
        creerNotification(groupe.admins, `Nouvelle demande pour rejoindre ${groupe.nom}`);
    }
}

function accepterDemande(utilisateurId, groupeId) {
    const groupe = groupes.find(g => g.id === groupeId);
    if (groupe && groupe.admins.includes(utilisateurActuel.id)) {
        groupe.membres.push(utilisateurId);
        groupe.demandes = groupe.demandes.filter(id => id !== utilisateurId);
        sauvegarderGroupes();
        creerNotification([utilisateurId], `Vous avez été accepté dans le groupe ${groupe.nom}`);
        afficherGroupes();
    }
}

// Fonctions de lecture du Coran
function demarrerLectureCoran(groupeId) {
    const groupe = groupes.find(g => g.id === groupeId);
    if (groupe && groupe.admins.includes(utilisateurActuel.id)) {
        const lecture = {
            groupeId: groupeId,
            type: 'coran',
            juzDisponibles: Array.from({length: 30}, (_, i) => i + 1),
            selections: {}
        };
        lecturesActives.push(lecture);
        sauvegarderLectures();
        creerNotification(groupe.membres, `Une nouvelle lecture du Coran a commencé dans ${groupe.nom}`);
        afficherJuz(groupeId);
    }
}

function selectionnerJuz(groupeId, juzNumber) {
    const lecture = lecturesActives.find(l => l.groupeId === groupeId && l.type === 'coran');
    if (lecture && lecture.juzDisponibles.includes(juzNumber)) {
        lecture.selections[juzNumber] = utilisateurActuel.id;
        lecture.juzDisponibles = lecture.juzDisponibles.filter(j => j !== juzNumber);
        sauvegarderLectures();
        afficherJuz(groupeId);
    }
}

// Fonctions de gestion des Douas
function ajouterDoua(groupeId) {
    const nom = document.getElementById('doua-name').value;
    const total = parseInt(document.getElementById('doua-count').value);
    const dateLimite = document.getElementById('doua-deadline').value;
    if (nom && total && dateLimite) {
        const doua = {
            id: Date.now(),
            groupeId: groupeId,
            nom: nom,
            total: total,
            reste: total,
            dateLimite: dateLimite,
            participants: []
        };
        lecturesActives.push(doua);
        sauvegarderLectures();
        creerNotification(groupes.find(g => g.id === groupeId).membres, `Nouveau Doua ajouté : ${nom}`);
        afficherDouas(groupeId);
    }
}

function participerDoua(douaId, nombre) {
    const doua = lecturesActives.find(d => d.id === douaId && d.type === 'doua');
    if (doua && nombre <= doua.reste) {
        doua.reste -= nombre;
        doua.participants.push({ utilisateur: utilisateurActuel.id, nombre: nombre });
        sauvegarderLectures();
        afficherDouas(doua.groupeId);
    }
}

// Fonctions utilitaires
function creerNotification(destinataires, message) {
    const notification = {
        id: Date.now(),
        destinataires: destinataires,
        message: message,
        lu: false
    };
    notifications.push(notification);
    sauvegarderNotifications();
    afficherNotifications();
}

function sauvegarderGroupes() {
    localStorage.setItem('groupes', JSON.stringify(groupes));
}

function sauvegarderLectures() {
    localStorage.setItem('lecturesActives', JSON.stringify(lecturesActives));
}

function sauvegarderNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function chargerDonnees() {
    groupes = JSON.parse(localStorage.getItem('groupes')) || [];
    lecturesActives = JSON.parse(localStorage.getItem('lecturesActives')) || [];
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    utilisateurActuel = JSON.parse(localStorage.getItem('utilisateurActuel'));
}

// Fonctions d'affichage
function mettreAJourInterface() {
    if (utilisateurActuel) {
        document.getElementById('auth-panel').style.display = 'none';
        document.getElementById('user-panel').style.display = 'block';
        document.getElementById('user-name').textContent = utilisateurActuel.name;
        afficherGroupes();
        afficherNotifications();
    } else {
        document.getElementById('auth-panel').style.display = 'block';
        document.getElementById('user-panel').style.display = 'none';
    }
}

function afficherGroupes() {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';
    groupes.forEach(groupe => {
        const groupeElement = document.createElement('div');
        groupeElement.className = 'group-item';
        groupeElement.textContent = groupe.nom;
        if (groupe.membres.includes(utilisateurActuel.id)) {
            groupeElement.classList.add('member');
            groupeElement.onclick = () => afficherDetailsGroupe(groupe.id);
        } else {
            groupeElement.onclick = () => demanderRejoindreGroupe(groupe.id);
        }
        groupList.appendChild(groupeElement);
    });
}

function afficherDetailsGroupe(groupeId) {
    // Afficher les détails du groupe, les lectures actives, etc.
    afficherJuz(groupeId);
    afficherDouas(groupeId);
    if (groupes.find(g => g.id === groupeId).admins.includes(utilisateurActuel.id)) {
        afficherPanneauAdmin(groupeId);
    }
}

function afficherJuz(groupeId) {
    const juzList = document.getElementById('juz-list');
    juzList.innerHTML = '';
    const lecture = lecturesActives.find(l => l.groupeId === groupeId && l.type === 'coran');
    if (lecture) {
        for (let i = 1; i <= 30; i++) {
            const juzElement = document.createElement('div');
            juzElement.className = 'juz-item';
            juzElement.textContent = `Juz ${i}`;
            if (lecture.selections[i] === utilisateurActuel.id) {
                juzElement.classList.add('selected');
            } else if (lecture.selections[i]) {
                juzElement.classList.add('taken');
            } else {
                juzElement.onclick = () => selectionnerJuz(groupeId, i);
            }
            juzList.appendChild(juzElement);
        }
    }
}

function afficherDouas(groupeId) {
    const douaList = document.getElementById('doua-list');
    douaList.innerHTML = '';
    const douas = lecturesActives.filter(l => l.groupeId === groupeId && l.type === 'doua');
    douas.forEach(doua => {
        const douaElement = document.createElement('div');
        douaElement.className = 'doua-item';
        douaElement.innerHTML = `
            <h4>${doua.nom}</h4>
            <p>Reste : ${doua.reste} / ${doua.total}</p>
            <input type="number" placeholder="Nombre">
            <button onclick="participerDoua(${doua.id}, this.previousElementSibling.value)">Participer</button>
        `;
        douaList.appendChild(douaElement);
    });
}

function afficherPanneauAdmin(groupeId) {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.style.display = 'block';
    document.getElementByI
