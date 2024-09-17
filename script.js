let currentUser = null;
let lectureCoranActive = null;
let douas = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('start-coran').addEventListener('click', ouvrirLectureCoran);
    document.getElementById('set-coran-deadline').addEventListener('click', definirHeureFin);
    document.getElementById('add-doua').addEventListener('click', ajouterDoua);

    chargerDonnees();
    mettreAJourInterface();
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        currentUser = { name: 'Admin', isAdmin: true };
        showNotification('Connecté en tant qu\'administrateur');
    } else if (username === 'user' && password === 'user123') {
        currentUser = { name: 'Utilisateur', isAdmin: false };
        showNotification('Connecté en tant qu\'utilisateur');
    } else {
        showNotification('Identifiants incorrects', 'error');
        return;
    }

    mettreAJourInterface();
}

function ouvrirLectureCoran() {
    if (!currentUser.isAdmin) return;
    lectureCoranActive = {
        dateDebut: new Date().toISOString(),
        dateFin: null,
        juzDisponibles: Array.from({length: 30}, (_, i) => i + 1),
        selections: {}
    };
    sauvegarderDonnees();
    mettreAJourInterface();
    showNotification('Nouvelle lecture du Coran ouverte');
}

function definirHeureFin() {
    if (!currentUser.isAdmin) return;
    const deadline = document.getElementById('coran-deadline').value;
    if (lectureCoranActive && deadline) {
        lectureCoranActive.dateFin = new Date(deadline).toISOString();
        sauvegarderDonnees();
        mettreAJourInterface();
        showNotification('Heure de fin définie pour la lecture du Coran');
    }
}

function ajouterDoua() {
    if (!currentUser.isAdmin) return;
    const nom = document.getElementById('doua-name').value;
    const total = parseInt(document.getElementById('doua-count').value);
    const dateLimite = document.getElementById('doua-deadline').value;
    if (nom && total && dateLimite) {
        const doua = {
            id: Date.now(),
            nom: nom,
            total: total,
            reste: total,
            dateLimite: new Date(dateLimite).toISOString(),
            participants: []
        };
        douas.push(doua);
        sauvegarderDonnees();
        mettreAJourInterface();
        showNotification(`Nouveau Doua ajouté : ${nom}`);
    }
}

function selectionnerJuz(juzNumber) {
    if (!lectureCoranActive || !lectureCoranActive.juzDisponibles.includes(juzNumber)) return;
    if (new Date(lectureCoranActive.dateFin) < new Date()) {
        showNotification('La période de lecture est terminée', 'error');
        return;
    }
    lectureCoranActive.selections[juzNumber] = currentUser.name;
    lectureCoranActive.juzDisponibles = lectureCoranActive.juzDisponibles.filter(j => j !== juzNumber);
    sauvegarderDonnees();
    mettreAJourInterface();
    showNotification(`Juz ${juzNumber} sélectionné`);
}

function participerDoua(douaId, nombre) {
    const doua = douas.find(d => d.id === douaId);
    if (!doua || nombre > doua.reste) return;
    if (new Date(doua.dateLimite) < new Date()) {
        showNotification('La période pour ce Doua est terminée', 'error');
        return;
    }
    doua.reste -= nombre;
    doua.participants.push({ name: currentUser.name, nombre: parseInt(nombre) });
    sauvegarderDonnees();
    mettreAJourInterface();
    showNotification(`Participation enregistrée pour ${doua.nom}`);
}

function sauvegarderDonnees() {
    localStorage.setItem('lectureCoranActive', JSON.stringify(lectureCoranActive));
    localStorage.setItem('douas', JSON.stringify(douas));
}

function chargerDonnees() {
    lectureCoranActive = JSON.parse(localStorage.getItem('lectureCoranActive'));
    douas = JSON.parse(localStorage.getItem('douas')) || [];
}

function mettreAJourInterface() {
    document.getElementById('auth-panel').style.display = currentUser ? 'none' : 'block';
    document.getElementById('admin-panel').style.display = currentUser && currentUser.isAdmin ? 'block' : 'none';
    document.getElementById('user-panel').style.display = currentUser ? 'block' : 'none';

    if (currentUser) {
        mettreAJourStatutCoran();
        afficherJuz();
        afficherDouas();
    }
}

function mettreAJourStatutCoran() {
    const statusElement = document.getElementById('coran-status');
    if (lectureCoranActive) {
        const debut = new Date(lectureCoranActive.dateDebut);
        const fin = lectureCoranActive.dateFin ? new Date(lectureCoranActive.dateFin) : 'Non définie';
        statusElement.innerHTML = `
            <p>Lecture en cours</p>
            <p>Début : ${debut.toLocaleString()}</p>
            <p>Fin : ${fin === 'Non définie' ? fin : fin.toLocaleString()}</p>
        `;
    } else {
        statusElement.innerHTML = '<p>Aucune lecture en cours</p>';
    }
}

function afficherJuz() {
    const juzList = document.getElementById('juz-list');
    juzList.innerHTML = '';
    if (lectureCoranActive) {
        for (let i = 1; i <= 30; i++) {
            const juzElement = document.createElement('div');
            juzElement.className = 'juz-item';
            juzElement.textContent = `Juz ${i}`;
            if (lectureCoranActive.selections[i]) {
                juzElement.classList.add('selected');
                juzElement.textContent += ` (${lectureCoranActive.selections[i]})`;
            } else if (lectureCoranActive.juzDisponibles.includes(i)) {
                juzElement.onclick = () => selectionnerJuz(i);
            } else {
                juzElement.classList.add('taken');
            }
            juzList.appendChild(juzElement);
        }
    }
}

function afficherDouas() {
    const douaList = document.getElementById('doua-list');
    douaList.innerHTML = '';
    douas.forEach(doua => {
        const douaElement = document.createElement('div');
        douaElement.className = 'doua-item';
        const isExpired = new Date(doua.dateLimite) < new Date();
        if (isExpired) douaElement.classList.add('expired');
        douaElement.innerHTML = `
            <h4>${doua.nom}</h4>
            <p>Reste : ${doua.reste} / ${doua.total}</p>
            <p>Date limite : ${new Date(doua.dateLimite).toLocaleString()}</p>
            ${!isExpired ? `
                <input type="number" placeholder="Nombre" max="${doua.reste}">
                <button onclick="participerDoua(${doua.id}, this.previousElementSibling.value)">Participer</button>
            ` : '<p>Terminé</p>'}
        `;
        douaList.appendChild(douaElement);
    });
}

function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.getElementById('notifications').appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}
