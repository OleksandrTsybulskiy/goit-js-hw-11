import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '39215228-7f7f32c48d65cadc310432918';

const elements = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
};

let page = 1;
let query = '';
const per_page = 40;
const { searchQuery } = elements.form.elements;

let bigImg = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

async function getImages(query, page) {
  const params = new URLSearchParams({
    key: `${API_KEY}`,
    q: `${query}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: `${page}`,
    per_page: `${per_page}`,
  });

  try {
    const response = await axios.get(`${BASE_URL}?${params}`);
    return response.data;
  } 
  catch (error) {
    console.error(error);
  }
}

elements.form.addEventListener('submit', handlerSubmit);

async function handlerSubmit(evt) {
  evt.preventDefault();
  elements.gallery.innerHTML = '';
  query = searchQuery.value.trim();
  page = 1;
  if (query === '') {
    Notiflix.Notify.warning("Please fill out the search field");
    return;
  }

  try {
    const data = await getImages(query, page);

    if (data.hits.length === 0) {
      elements.loadMoreBtn.classList.replace('visible', 'hidden');
      Notiflix.Notify.info("Sorry, there are no images matching your search query. Please try again.");

      Notiflix.Notify.info.remove("We're sorry, but you've reached the end of search results.");

    } else {
      createMarkup(data.hits);
      bigImg.refresh();
      Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
    }

    if (page < data.totalHits / per_page) {
      elements.loadMoreBtn.classList.replace('hidden', 'visible');
    } 

    else {
        elements.loadMoreBtn.classList.replace('visible', 'hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } 

  catch (error) {
    console.error(error);
  }
};

function createMarkup(arr) {
    const card = arr
      .map(
        image => `
       <div class="card">
       <a class="img-link" href="${image.largeImageURL}">
       <img class="img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" width="300" height = "300" />
       </a>
       <div class="info">
          <p class="info-item"><span class="info-text">Likes: </span><b>${image.likes}</b></p>
          <p class="info-item"><span class="info-text">Views: </span><b>${image.views}</b></p>
          <p class="info-item"><span class="info-text">Comments: </span><b>${image.comments}</b></p>
          <p class="info-item"><span class="info-text">Downloads: </span><b>${image.downloads}</b></p>
       </div>
      </div>`).join('');
    elements.gallery.insertAdjacentHTML('beforeend', card);
};

elements.loadMoreBtn.addEventListener('click', loadMore);

async function loadMore() {
  page += 1;
  try {
    const data = await getImages(query, page);
    createMarkup(data.hits);
    bigImg.refresh();
    const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 1.5,
      behavior: 'smooth',
    });

    Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);

    if (page < data.totalHits / per_page) {
      elements.loadMoreBtn.classList.replace('hidden', 'load-more-style');
    } else {
        elements.loadMoreBtn.classList.replace('visible', 'hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.error(error);
  }
};