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
  
const openModalBtn = document.getElementById('open-modal-btn');
const modal = document.getElementById('posts-modal');
const closeModal = document.getElementById('close-modal');
const modalPostsContainer = document.getElementById('modal-posts');
  
let allPosts = [];

/**
 * Renders posts in a container after they are loaded
 * @param {Array} posts - array of post objects
 */
  
function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = '<p class="info-message">Немає жодного посту. Створіть перший!</p>';
    openModalBtn.style.display = 'none';
    return;
  }
  
  openModalBtn.style.display = posts.length > 2 ? 'block' : 'none';
  
  const visiblePosts = posts.slice(0, 2);
  
    postsContainer.innerHTML = visiblePosts
      .map((p) => `
        <div class="post" data-id="${p.id}">
          <h3>${escapeHtml(p.title)}</h3>
          <p><b>Author:</b> ${escapeHtml(p.author)}</p>
          <p>${escapeHtml(p.description)}</p>
          <div class="actions">
            <button class="btn primary edit-btn"
                    data-id="${p.id}"
                    data-title="${escapeAttr(p.title)}"
                    data-author="${escapeAttr(p.author)}"
                    data-description="${escapeAttr(p.description)}">
              Edit
            </button>
  
            <button class="btn danger delete-btn" data-id="${p.id}">
              Delete
            </button>
          </div>
        </div>
      `).join('');
  }
  
  function renderModalPosts(posts) {
    if (!posts || posts.length === 0) {
      modalPostsContainer.innerHTML = '<p class="info-message">Немає жодного посту.</p>';
      return;
    }
  
    modalPostsContainer.innerHTML = posts
      .map((p) => `
        <div class="post" data-id="${p.id}">
          <div class="post-actions-top">
            <button class="btn small primary edit-btn"
                    data-id="${p.id}"
                    data-title="${escapeAttr(p.title)}"
                    data-author="${escapeAttr(p.author)}"
                    data-description="${escapeAttr(p.description)}">
              Edit
            </button>
            <button class="btn small danger delete-btn" data-id="${p.id}">Delete</button>
          </div>
  
          <h3>${escapeHtml(p.title)}</h3>
          <p><b>Author:</b> ${escapeHtml(p.author)}</p>
          <p>${escapeHtml(p.description)}</p>
        </div>
      `).join('');
  }
  
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str = '') {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

async function loadPosts() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Неможливо отримати дані.' }));
            postsContainer.innerHTML = `<p class="error-message">Помилка ${res.status}: ${errorData.message}</p>`;
            return;
        }
   
        const posts = await res.json();
        if (!Array.isArray(posts)) {
            postsContainer.innerHTML = '<p class="error-message">Некоректний формат даних від сервера.</p>';
            return;
        }
  
        allPosts = posts;
        renderPosts(allPosts);
  
      if (modal.style.display === 'block') renderModalPosts(allPosts);

    } catch (err) {
      postsContainer.innerHTML = '<p class="error-message">Помилка з’єднання з сервером.</p>';
      console.error(err);
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
    if (!confirm('Ви справді бажаєте видалити цей пост?')) return false;

    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Неможливо видалити пост.' }));
        alert(`Помилка видалення поста: ${errorData.message || response.statusText}`);
      return false;
    }

    await loadPosts();
    return true;
  }

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const post = {
        title: titleInput.value,
        author: authorInput.value,
        description: descriptionInput.value,
        ip: userId,
    };

    const isEditing = !!postIdInput.value;
    const url = isEditing ? `${API_URL}/${postIdInput.value}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Невідома помилка сервера.' }));
        alert(errorData.message || 'Помилка сервера');
    }

    resetForm();
    await loadPosts();
  });
  
postsContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest('.edit-btn')) {
      const btn = target.closest('.edit-btn');
      editPost(btn.dataset.id, btn.dataset.title, btn.dataset.author, btn.dataset.description);
    } else if (target.closest('.delete-btn')) {
      const btn = target.closest('.delete-btn');
      deletePost(btn.dataset.id);
    }
  });
  
  modalPostsContainer.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.closest('.edit-btn')) {
      const btn = target.closest('.edit-btn');
      modal.style.display = 'none';
      editPost(btn.dataset.id, btn.dataset.title, btn.dataset.author, btn.dataset.description);
  
    } else if (target.closest('.delete-btn')) {
      const btn = target.closest('.delete-btn');
      const ok = await deletePost(btn.dataset.id);
      if (ok && modal.style.display === 'block') {
        renderModalPosts(allPosts);
      }
    }
  });

  openModalBtn.addEventListener('click', () => {
    renderModalPosts(allPosts);
    modal.style.display = 'block';
  });
    
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
    
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

cancelBtn.addEventListener('click', resetForm);

loadPosts();