const input = document.getElementsByClassName("input__search")[0];
const autocompleteList = document.getElementsByClassName("autocomplete-list")[0];
const repoList = document.getElementsByClassName("repo-list")[0];
const loader = document.getElementsByClassName("loader")[0];

let repos = [];

const fetchRepositories = async (query) => {
    if (!query) {
        autocompleteList.style.display = "none";
        return;
    }
    loader.classList.toggle("loader-active");

    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`);
    const data = await response.json();

    loader.classList.toggle("loader-active");

    displayAutocomplete(data.items);
};
const displayAutocomplete = (items) => {
    autocompleteList.innerHTML = "";

    if (items.length === 0) {
        autocompleteList.style.display = "none";
        return;
    }

    items.slice(0, 5).forEach((item) => {
        const div = document.createElement("div");
        div.textContent = item.name;
        div.classList.add("autocomplete-item");

        div.onclick = () => {
            addRepository(item);
            input.value = "";
            autocompleteList.style.display = "none";
        };

        autocompleteList.appendChild(div);
    });

    autocompleteList.style.display = "flex";
};
const addRepository = (repo) => {
    if (!repos.find((r) => r.id === repo.id)) {
        repos.push({
            id: repo.id, name: repo.name, owner: repo.owner.login, stars: repo.stargazers_count,
        });
        renderRepoList();
    }
};
const getRepositories = (query) => {
    if (!query) {
        autocompleteList.style.display = "none";
        return;
    }
    fetchRepositories(query);
};
const renderRepoList = () => {
    repoList.innerHTML = "";
    repos.forEach((repo) => {
        const repoItemHTML = `
            <div class="repo-item">
                <span>${repo.name} by <span class="repo-owner">${repo.owner}</span> ( ⭐ ${repo.stars} )</span>
                <button class="remove-button" data-id="${repo.id}">Удалить</button>
            </div>
        `;
        repoList.insertAdjacentHTML("beforeend", repoItemHTML);
    });
    setupRemoveButtons();
};
const setupRemoveButtons = () => {
    const removeButtons = document.querySelectorAll(".remove-button");
    removeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const repoId = parseInt(e.target.dataset.id, 10);
            removeRepository(repoId);
        });
    });
};
const removeRepository = (id) => {
    repos = repos.filter((repo) => repo.id !== id);
    renderRepoList();
};

input.addEventListener("keydown", (event) => {
    if (event.key === " " && input.value.trim() === "") {
        event.preventDefault();
    }
});

input.addEventListener("input", debounce((event) => {
    getRepositories(event.target.value);
}, 400));

document.addEventListener("click", (e) => {
    if (!autocompleteList.contains(e.target) && e.target !== input) {
        autocompleteList.style.display = "none";
    } else if (e.target === input) {
        getRepositories(input.value);
    }
});

function debounce(func, delay) {
    let timer;
    return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
    };
}