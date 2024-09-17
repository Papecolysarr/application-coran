let lectureCoranActive = null;
let douas = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-coran').addEventListener('click', demarrerLectureCoran);
    document.getElementById('add-doua').addEventListener('click', ajouterDoua);
    
    chargerDonnees();
    afficherJuz();
    afficherDouas();
});

function demarrerLectureCoran() {
    lectureCoranActive = {
        juzDisponibles: Array.from({length: 30}, (_, i) => i + 1),
        selections: {}
    };
    sauvegarderDonnees();
    afficherJuz();
}

function selectionnerJuz(juzNumber) {
    if (lectureCoranActive && lectureCoranActive.juzDisponibles.includes(juzNumber)) {
        lectureCoranActive.selections[juzNumber] = true;
        lectureCoranActive.juzDisponibles = lectureCoranActive.juzDisponibles.filter(j => j !== juzNumber);
        sauvegarderDonnees();
        afficherJuz();
    }
}

function ajouterDoua() {
    const nom = document.getElementById('doua-name').value;
    const total = parseInt(document.getElementById('doua-count').value);
    const dateLimite = document.getElementById('doua-deadline').value;
    if (nom && total && dateLimite) {
        const doua = {
            id: Date.now(),
            nom: nom,
            total: total,
            reste: total,
            dateLimite: dateLimite,
            participants: []
        };
        douas.push(doua);
        sauvegarderDonnees();
        afficherDouas();
    }
}

function participerDoua(douaId, nombre) {
    const doua = douas.find(d => d.id === douaId);
    if (doua && nombre <= doua.reste) {
        doua.reste -= nombre;
        doua.participants.push({ id: Date.now(), nombre: nombre });
        sauvegarderDonnees();
        afficherDouas();
    }
}

function sauvegarderDonnees() {
    localStorage.setItem('lectureCoranActive', JSON.stringify(lectureCoranActive));
    localStorage.setItem('douas', JSON.stringify(douas));
}

function chargerDonnees() {
    lectureCoranActive = JSON.parse(localStorage.getItem('lectureCoranActive'));
    douas = JSON.parse(localStorage.getItem('douas')) || [];
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
            } else {
                juzElement.onclick = () => selectionnerJuz(i);
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
        douaElement.innerHTML = `
            <h4>${doua.nom}</h4>
            <p>Reste : ${doua.reste} / ${doua.total}</p>
            <input type="number" placeholder="Nombre">
            <button onclick="participerDoua(${doua.id}, this.previousElementSibling.value)">Participer</button>
        `;
        douaList.appendChild(douaElement);
    });
}
