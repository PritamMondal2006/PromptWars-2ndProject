// Mock Data
const constituencies = [
    { id: 'c1', name: 'Kolkata Dakshin' },
    { id: 'c2', name: 'Jadavpur' },
    { id: 'c3', name: 'Diamond Harbour' },
    { id: 'c4', name: 'Howrah' },
    { id: 'c5', name: 'Asansol' }
];

const candidatesData = [
    { id: 'can1', constId: 'c1', name: 'Mala Roy', party: 'AITC', partyClass: 'party-tmc', img: 'fa-user-tie' },
    { id: 'can2', constId: 'c1', name: 'Debasree Chaudhuri', party: 'BJP', partyClass: 'party-bjp', img: 'fa-user' },
    { id: 'can3', constId: 'c1', name: 'Saira Shah Halim', party: 'CPI(M)', partyClass: 'party-cpi', img: 'fa-user-astronaut' },
    
    { id: 'can4', constId: 'c2', name: 'Saayoni Ghosh', party: 'AITC', partyClass: 'party-tmc', img: 'fa-user-doctor' },
    { id: 'can5', constId: 'c2', name: 'Anirban Ganguly', party: 'BJP', partyClass: 'party-bjp', img: 'fa-user-graduate' },
    { id: 'can6', constId: 'c2', name: 'Sujan Chakraborty', party: 'CPI(M)', partyClass: 'party-cpi', img: 'fa-user-nurse' },
    
    { id: 'can7', constId: 'c3', name: 'Abhishek Banerjee', party: 'AITC', partyClass: 'party-tmc', img: 'fa-user-tie' },
    { id: 'can8', constId: 'c3', name: 'Abhijit Das', party: 'BJP', partyClass: 'party-bjp', img: 'fa-user' },
    
    { id: 'can9', constId: 'c4', name: 'Prasun Banerjee', party: 'AITC', partyClass: 'party-tmc', img: 'fa-user-astronaut' },
    { id: 'can10', constId: 'c4', name: 'Rathin Chakraborty', party: 'BJP', partyClass: 'party-bjp', img: 'fa-user-doctor' },
    
    { id: 'can11', constId: 'c5', name: 'Shatrughan Sinha', party: 'AITC', partyClass: 'party-tmc', img: 'fa-user-graduate' },
    { id: 'can12', constId: 'c5', name: 'S. S. Ahluwalia', party: 'BJP', partyClass: 'party-bjp', img: 'fa-user-tie' },
];

// In-memory reviews store
const reviewsStore = {
    'can1': [
        { name: 'Arijit', rating: 4, text: 'Good work in the constituency.' },
        { name: 'Sneha', rating: 3, text: 'Could improve road infrastructure.' }
    ],
    'can7': [
        { name: 'Rahul', rating: 5, text: 'Very dynamic leader.' }
    ]
};

// Past Election Results Data
const electionResults = {
    '2021': { // Vidhan Sabha
        labels: ['AITC', 'BJP', 'ISF', 'Others'],
        data: [215, 77, 1, 1],
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#94A3B8']
    },
    '2019': { // Lok Sabha
        labels: ['AITC', 'BJP', 'INC', 'Others'],
        data: [22, 18, 2, 0],
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#94A3B8']
    }
};

let currentChart = null;

// DOM Elements
const constSelect = document.getElementById('constituency-select');
const candidatesContainer = document.getElementById('candidates-container');
const modal = document.getElementById('review-modal');
const closeBtn = document.querySelector('.close-btn');
const starRating = document.getElementById('star-rating');
const reviewForm = document.getElementById('review-form');

let selectedCandidateId = null;
let currentRating = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateConstituencies();
    initChart('2021'); // Load 2021 data by default
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Constituency change
    constSelect.addEventListener('change', (e) => {
        renderCandidates(e.target.value);
    });

    // Close modal
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Star rating logic
    const stars = starRating.querySelectorAll('i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-value'));
            updateStarsUI(currentRating);
        });
    });

    // Submit review
    reviewForm.addEventListener('submit', handleReviewSubmit);

    // Chart toggles
    const toggleBtns = document.querySelectorAll('.results-toggle .btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            toggleBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update chart
            const year = e.target.getAttribute('data-year');
            updateChart(year);
        });
    });
}

function populateConstituencies() {
    constituencies.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        constSelect.appendChild(option);
    });
}

function getAverageRating(candidateId) {
    const reviews = reviewsStore[candidateId] || [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

function renderCandidates(constId) {
    candidatesContainer.innerHTML = '';
    
    const filteredCandidates = candidatesData.filter(c => c.constId === constId);
    
    if (filteredCandidates.length === 0) {
        candidatesContainer.innerHTML = '<p class="text-center w-100">Please select a constituency to view candidates.</p>';
        return;
    }

    filteredCandidates.forEach(candidate => {
        const avgRating = getAverageRating(candidate.id);
        const reviewsCount = (reviewsStore[candidate.id] || []).length;

        const card = document.createElement('div');
        card.className = `candidate-card ${candidate.partyClass}`;
        card.innerHTML = `
            <div class="card-header">
                <div class="candidate-avatar">
                    <i class="fa-solid ${candidate.img}"></i>
                </div>
            </div>
            <div class="card-body">
                <h3 class="candidate-name">${candidate.name}</h3>
                <span class="party-badge">${candidate.party}</span>
                <div class="avg-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${avgRating > 0 ? avgRating : 'No ratings yet'} (${reviewsCount} reviews)</span>
                </div>
                <button class="btn review-btn" onclick="openReviewModal('${candidate.id}')">
                    View & Leave Review
                </button>
            </div>
        `;
        candidatesContainer.appendChild(card);
    });
}

function openReviewModal(candidateId) {
    selectedCandidateId = candidateId;
    const candidate = candidatesData.find(c => c.id === candidateId);
    
    document.getElementById('modal-candidate-name').textContent = candidate.name;
    document.getElementById('modal-candidate-party').textContent = candidate.party;
    
    renderReviews(candidateId);
    
    // Reset form
    reviewForm.reset();
    currentRating = 0;
    updateStarsUI(0);
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    selectedCandidateId = null;
}

function renderReviews(candidateId) {
    const reviewsList = document.getElementById('reviews-list');
    const reviews = reviewsStore[candidateId] || [];
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    let html = '';
    reviews.forEach(review => {
        let starsHtml = '';
        for(let i=1; i<=5; i++) {
            starsHtml += `<i class="fa-solid fa-star" style="color: ${i <= review.rating ? 'var(--secondary)' : '#cbd5e1'}"></i>`;
        }
        
        html += `
            <div class="review-item">
                <div class="review-header">
                    <span class="reviewer">${review.name || 'Anonymous'}</span>
                    <span class="review-stars">${starsHtml}</span>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `;
    });
    reviewsList.innerHTML = html;
}

function updateStarsUI(rating) {
    const stars = starRating.querySelectorAll('i');
    stars.forEach(star => {
        const val = parseInt(star.getAttribute('data-value'));
        if (val <= rating) {
            star.classList.add('active');
            star.style.color = 'var(--secondary)';
        } else {
            star.classList.remove('active');
            star.style.color = '#cbd5e1';
        }
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    if (currentRating === 0) {
        alert('Please select a star rating.');
        return;
    }
    
    const name = document.getElementById('reviewer-name').value;
    const text = document.getElementById('review-text').value;
    
    if (!reviewsStore[selectedCandidateId]) {
        reviewsStore[selectedCandidateId] = [];
    }
    
    reviewsStore[selectedCandidateId].unshift({
        name: name,
        rating: currentRating,
        text: text
    });
    
    // Re-render
    renderReviews(selectedCandidateId);
    renderCandidates(constSelect.value); // Update avg rating on card
    
    // Reset form
    reviewForm.reset();
    currentRating = 0;
    updateStarsUI(0);
}

// Chart.js Setup
function initChart(year) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    const data = electionResults[year];
    
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: "'Inter', sans-serif", size: 14 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + ' Seats';
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function updateChart(year) {
    const data = electionResults[year];
    if (currentChart) {
        currentChart.data.labels = data.labels;
        currentChart.data.datasets[0].data = data.data;
        currentChart.data.datasets[0].backgroundColor = data.colors;
        currentChart.update();
    }
}
