let groupes = [];
let lecturesActives = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('create-group').addEventListener('click', creerGroupe);
    
    chargerDonnees();
    afficherGroupes();
});

function creerGroupe() {
    const nom = document.getElementById('new-group-name').value;
    if (nom) {
        const groupe = {
            id: Date.now(),
            nom: nom,
            membres: [],
            admins: []
        };
        groupes.push(groupe);
        sauvegarderGroupes();
        afficherGroupes();
    } else {
        alert("Veuillez entrer un nom de groupe.");
    }
}

function rejoindreGroupe(groupeId) {
    const groupe = groupes.find(g => g.id === groupeId);
    if (groupe) {
        groupe.membres.push(Date.now()); // Utilise un ID unique pour chaque membre
        sauvegarderGroupes();
        afficherDetailsGroupe(groupeId);
    }
}

function demarrerLectureCoran(groupeId) {
    const groupe = groupes.find(g => g.id === groupeId);
    if (groupe) {
        const lecture = {
            groupeId: groupeId,
            type: 'coran',
            juzDisponibles: Array.from({length: 30}, (_, i) => i + 1),
            selections: {}
        };
        lecturesActives.push(lecture);
        sauvegarderLectures();
        afficherJuz(groupeId);
    }
}

function selectionnerJuz(groupeId, juzNumber) {
    const lecture = lecturesActives.find(l => l.groupeId === groupeId && l.type === 'coran');
    if (lecture && lecture.juzDisponibles.includes(juzNumber)) {
        lecture.selections[juzNumber] = Date.now(); // Utilise un ID unique pour chaque sélection
        lecture.juzDisponibles = lecture.juzDisponibles.filter(j => j !== juzNumber);
        sauvegarderLectures();
        afficherJuz(groupeId);
    }
}

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
        afficherDouas(groupeId);
    }
}

function participerDoua(douaId, nombre) {
    const doua = lecturesActives.find(d => d.id === douaId && d.type === 'doua');
    if (doua && nombre <= doua.reste) {
        doua.reste -= nombre;
        doua.participants.push({ id: Date.now(), nombre: nombre });
        sauvegarderLectures();
        afficherDouas(doua.groupeId);
    }
}

function sauvegarderGroupes() {
    localStorage.setItem('groupes', JSON.stringify(groupes));
}

function sauvegarderLectures() {
    localStorage.setItem('lecturesActives', JSON.stringify(lecturesActives));
}

function chargerDonnees() {
    groupes = JSON.parse(localStorage.getItem('groupes')) || [];
    lecturesActives = JSON.parse(localStorage.getItem('lecturesActives')) || [];
}

function afficherGroupes() {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';
    groupes.forEach(groupe => {
        const groupeElement = document.createElement('div');
        groupeElement.className = 'group-item';
        groupeElement.textContent = groupe.nom;
        groupeElement.onclick = () => afficherDetailsGroupe(groupe.id);
        groupList.appendChild(groupeElement);
    });
}

function afficherDetailsGroupe(groupeId) {
    afficherJuz(groupeId);
    afficherDouas(groupeId);
    document.getElementById('admin-panel').style.display = 'block';
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
            if (lecture.selections[i]) {
                juzElement.classList.add('selected');
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

// Initialisation
document.getElementById('start-coran').addEventListener('click', () => demarrerLectureCoran(groupes[0]?.id));
document.getElementById('add-doua').addEventListener('click', () => ajouterDoua(groupes[0]?.id));
