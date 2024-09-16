const totalJuz = 30;
let juzTermines = 0;
let douas = [];
let utilisateurActuel = null;
let codeVerification = null;

function envoyerCode() {
    const phoneNumber = document.getElementById('phone-number').value;
    if (phoneNumber) {
        // Simuler l'envoi d'un code SMS
        codeVerification = Math.floor(1000 + Math.random() * 9000);
        
        // Afficher le code sur la page
        const codeDisplay = document.createElement('p');
        codeDisplay.textContent = `Code de vérification : ${codeVerification}`;
        codeDisplay.style.color = 'red';
        document.getElementById('auth-panel').appendChild(codeDisplay);
        
        document.getElementById('verification-code').style.display = 'block';
        document.getElementById('password').style.display = 'block';
        document.getElementById('auth-button').style.display = 'block';
    } else {
        alert('Veuillez entrer un numéro de téléphone');
    }
}

function authentifier() {
    const phoneNumber = document.getElementById('phone-number').value;
    const enteredCode = document.getElementById('verification-code').value;
    const password = document.getElementById('password').value;
    
    if (parseInt(enteredCode) !== codeVerification) {
        alert('Code de vérification incorrect');
        return;
    }
    
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs')) || [];
    let utilisateur = utilisateurs.find(u => u.phoneNumber === phoneNumber);
    
    if (utilisateur) {
        // Connexion
        if (utilisateur.password === password) {
            utilisateurActuel = utilisateur;
            alert('Connexion réussie !');
        } else {
            alert('Mot de passe incorrect.');
            return;
        }
    } else {
        // Inscription
        utilisateur = { phoneNumber, password, estAdmin: false };
        utilisateurs.push(utilisateur);
        localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
        utilisateurActuel = utilisateur;
        alert('Inscription réussie !');
    }
    
    mettreAJourInterface();
}

function mettreAJourInterface() {
    if (utilisateurActuel) {
        document.getElementById('auth-panel').style.display = 'none';
        document.getElementById('user-panel').style.display = 'block';
        document.getElementById('douas-panel').style.display = 'block';
        if (utilisateurActuel.estAdmin) {
            document.getElementById('admin-panel').style.display = 'block';
        }
        initialiserApplication();
    } else {
        document.getElementById('auth-panel').style.display = 'block';
        document.getElementById('user-panel').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('douas-panel').style.display = 'none';
    }
}

function initialiserApplication() {
    creerListeJuz();
    chargerProgression();
    chargerDouas();
    afficherDateLimite();
    verifierDateLimite();
    verifierDateLimiteDouas();
    setInterval(verifierDateLimiteDouas, 60000);
}

function creerListeJuz() {
    const listeJuz = document.getElementById('liste-juz');
    listeJuz.innerHTML = '';
    for (let i = 1; i <= totalJuz; i++) {
        const juz = document.createElement('div');
        juz.className = 'juz';
        juz.textContent = `Juz ${i}`;
        juz.onclick = function() {
            this.classList.toggle('selected');
        };
        juz.ondblclick = function() {
            this.classList.toggle('completed');
            mettreAJourCompteur();
        };
        listeJuz.appendChild(juz);
    }
}

function mettreAJourCompteur() {
    juzTermines = document.querySelectorAll('.juz.completed').length;
    document.getElementById('compteur').textContent = `Juz terminés : ${juzTermines} / ${totalJuz}`;
}

function sauvegarderProgression() {
    const juzs = document.querySelectorAll('.juz');
    const progression = Array.from(juzs).map(juz => ({
        numero: juz.textContent.split(' ')[1],
        selectionne: juz.classList.contains('selected'),
        termine: juz.classList.contains('completed')
    }));
    localStorage.setItem(`progression_${utilisateurActuel.phoneNumber}`, JSON.stringify(progression));
    alert('Progression du Coran sauvegardée !');
}

function chargerProgression() {
    const progression = JSON.parse(localStorage.getItem(`progression_${utilisateurActuel.phoneNumber}`));
    if (progression) {
        const juzs = document.querySelectorAll('.juz');
        progression.forEach((juz, index) => {
            if (juz.selectionne) juzs[index].classList.add('selected');
            if (juz.termine) juzs[index].classList.add('completed');
        });
        mettreAJourCompteur();
    }
}

function definirDateLimite() {
    const dateLimite = document.getElementById('admin-date-fin').value;
    localStorage.setItem('dateLimite', dateLimite);
    afficherDateLimite();
    alert('Date limite globale définie !');
}

function afficherDateLimite() {
    const dateLimite = localStorage.getItem('dateLimite');
    if (dateLimite) {
        const date = new Date(dateLimite);
        document.getElementById('date-limite').textContent = `Date limite globale : ${date.toLocaleString()}`;
    }
}

function verifierDateLimite() {
    const dateLimite = new Date(localStorage.getItem('dateLimite'));
    const maintenant = new Date();
    if (dateLimite < maintenant) {
        alert("La date limite globale est dépassée !");
    }
}

function ajouterDoua() {
    const nom = document.getElementById('doua-nom').value;
    const total = parseInt(document.getElementById('doua-total').value);
    const dateLimite = document.getElementById('doua-date-limite').value;
    
    if (nom && total && dateLimite) {
        const doua = { nom, total, reste: total, participants: [], dateLimite };
        douas.push(doua);
        sauvegarderDouas();
        afficherDouas();
        document.getElementById('doua-nom').value = '';
        document.getElementById('doua-total').value = '';
        document.getElementById('doua-date-limite').value = '';
    } else {
        alert('Veuillez remplir tous les champs pour le doua');
    }
}

function sauvegarderDouas() {
    localStorage.setItem('douas', JSON.stringify(douas));
}

function chargerDouas() {
    const douasStockes = localStorage.getItem('douas');
    if (douasStockes) {
        douas = JSON.parse(douasStockes);
        afficherDouas();
    }
}

function afficherDouas() {
    const listeDouas = document.getElementById('liste-douas');
    listeDouas.innerHTML = '';
    douas.forEach((doua, index) => {
        const douaElement = document.createElement('div');
        douaElement.className = 'doua-item';
        const progressPercent = ((doua.total - doua.reste) / doua.total) * 100;
        douaElement.innerHTML = `
            <h3>${doua.nom}</h3>
            <p>Total: ${doua.total}, Reste: ${doua.reste}</p>
            <p>Date limite: ${new Date(doua.dateLimite).toLocaleString()}</p>
            <div class="doua-progress">
                <div class="doua-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            ${!utilisateurActuel.estAdmin ? `
                <input type="number" id="doua-choix-${index}" placeholder="Nombre à réciter">
                <button onclick="choisirDoua(${index})">Choisir</button>
            ` : ''}
            ${doua.participants.find(p => p.utilisateur === utilisateurActuel.phoneNumber && !p.termine) ? `
                <button onclick="terminerDoua(${index})">Marquer comme terminé</button>
            ` : ''}
        `;
        listeDouas.appendChild(douaElement);
    });
}

function choisirDoua(index) {
    const choix = parseInt(document.getElementById(`doua-choix-${index}`).value);
    if (choix && choix <= douas[index].reste) {
        douas[index].reste -= choix;
        douas[index].participants.push({ utilisateur: utilisateurActuel.phoneNumber, nombre: choix, termine: false });
        sauvegarderDouas();
        afficherDouas();
    } else {
        alert('Nombre invalide ou supérieur au reste disponible');
    }
}

function terminerDoua(index) {
    const participantIndex = douas[index].participants.findIndex(p => p.utilisateur === utilisateurActuel.phoneNumber && !p.termine);
    if (participantIndex !== -1) {
        douas[index].participants[participantIndex].termine = true;
        sauvegarderDouas();
        afficherDouas();
        alert('Doua marqué comme terminé !');
    }
}

function verifierDateLimiteDouas() {
    const maintenant = new Date();
    douas.forEach(doua => {
        const dateLimiteDoua = new Date(doua.dateLimite);
        if (dateLimiteDoua < maintenant) {
            alert(`La date limite pour le doua "${doua.nom}" est dépassée !`);
        }
    });
}

window.onload = function() {
    document.getElementById('send-code').addEventListener('click', envoyerCode);
    document.getElementById('auth-button').addEventListener('click', authentifier);
    document.getElementById('sauvegarder').addEventListener('click', sauvegarderProgression);
    if (document.getElementById('admin-sauvegarder')) {
        document.getElementById('admin-sauvegarder').addEventListener('click', definirDateLimite);
    }
    if (document.getElementById('ajouter-doua')) {
        document.getElementById('ajouter-doua').addEventListener('click', ajouterDoua);
    }
    mettreAJourInterface();
};