if (!localStorage.getItem('userId')) {
  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  
  const newId = (crypto.randomUUID ? crypto.randomUUID() : generateUUID());
  localStorage.setItem('userId', newId);
}

const userId = localStorage.getItem('userId');

const API_URL = '/api/posts';
const form = document.getElementById('post-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const descriptionInput = document.getElementById('description');
const postsContainer = document.getElementById('posts');
const postIdInput = document.getElementById('post-id');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');

/**
 * Renders posts in a container after they are loaded
 * @param {Array} posts - array of post objects
 */
function renderPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="info-message">Немає жодного посту. Створіть перший!</p>';
        return;
    }

    postsContainer.innerHTML = posts
        .map(
            (p) => `
            <div class="post" data-id="${p.id}">
              <h3>${p.title}</h3>
              <p><b>Author:</b> ${p.author}</p>
              <p>${p.description}</p>
              <div class="actions">
                <button class="btn primary edit-btn" 
                        data-id="${p.id}" 
                        data-title="${p.title}" 
                        data-author="${p.author}" 
                        data-description="${p.description}">Edit</button>
                <button class="btn danger delete-btn" data-id="${p.id}">Delete</button>
              </div>
            </div>
        `
        )
        .join('');
}

async function loadPosts() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Неможливо отримати дані.' }));
            console.error(`Помилка завантаження постів: ${res.status}`, errorData);
            postsContainer.innerHTML = `<p class="error-message">Помилка ${res.status}: Не вдалося завантажити пости. ${errorData.message || ''}</p>`;
            return;
        }

        const posts = await res.json();

        if (!Array.isArray(posts)) {
            console.error(" API повернув дані не у форматі масиву:", posts);
            postsContainer.innerHTML = '<p class="error-message">Помилка: Некоректний формат даних від сервера.</p>';
            return;
        }

        renderPosts(posts);

    } catch (error) {
        console.error("Критична помилка мережі:", error);
        postsContainer.innerHTML = '<p class="error-message">Критична помилка з’єднання з API.</p>';
    }
}

function editPost(id, title, author, description) {
    postIdInput.value = id;
    titleInput.value = title;
    authorInput.value = author;
    descriptionInput.value = description;
    formTitle.textContent = 'Edit post';
    cancelBtn.style.display = 'inline';
    form.scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    postIdInput.value = '';
    titleInput.value = '';
    authorInput.value = '';
    descriptionInput.value = '';
    formTitle.textContent = 'Create post';
    cancelBtn.style.display = 'none';
}

async function deletePost(id) {
    if (!confirm('Ви справді бажаєте видалити цей пост?')) {
        return;
    }

    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Неможливо видалити пост.' }));
        alert(`Помилка видалення поста: ${errorData.message || response.statusText}`);
    }

    loadPosts();
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const post = {
        title: titleInput.value,
        author: authorInput.value,
        description: descriptionInput.value,
        ip: userId,
    };

    let response;
    const isEditing = !!postIdInput.value;
    const url = isEditing ? `${API_URL}/${postIdInput.value}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Невідома помилка сервера.' }));
        alert(`Помилка збереження поста: ${errorData.message || response.statusText}`);
    }

    resetForm();
    loadPosts();
});

postsContainer.addEventListener('click', (e) => {
    const target = e.target;
    const postId = target.dataset.id;

    if (target.classList.contains('edit-btn')) {
        // Call the editPost function with the data stored in the data attributes
        editPost(
            postId,
            target.dataset.title,
            target.dataset.author,
            target.dataset.description
        );
    } else if (target.classList.contains('delete-btn')) {
        deletePost(postId);
    }
});

cancelBtn.addEventListener('click', resetForm);

loadPosts();