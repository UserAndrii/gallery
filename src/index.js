import throttle from 'lodash.throttle';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ImegesApiService from './js/gallery-service';
import {
  renderGallery,
  clearThePage,
  smoothScrolling,
} from './js/render-gallery';

const DEBOUNCE_DELAY = 300;

const refs = {
  form: document.querySelector('#search-form'),
  sentinel: document.querySelector('#sentinel'),
  loadMore: document.querySelector('.load-more'),
};

refs.form.addEventListener(
  'submit',
  throttle(handleFormSubmit, DEBOUNCE_DELAY)
);
refs.loadMore.addEventListener('click', onLoadMore);

const lightbox = new SimpleLightbox('.gallery a', {
  fadeSpeed: DEBOUNCE_DELAY,
});

const imegesApiService = new ImegesApiService();

function handleFormSubmit(e) {
  e.preventDefault();
  imegesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  fetchDataAndRenderPage();
}

async function fetchDataAndRenderPage() {
  if (!imegesApiService.query) {
    imegesApiService.emptySearchField();
    refs.form.reset();
    return;
  }

  clearThePage();
  refs.loadMore.style.display = 'none';
  imegesApiService.resetNumberPage();

  try {
    const fetch = await imegesApiService.fetchImages();
    if (fetch.data.total === 0) {
      imegesApiService.emptyArray();
      return;
    }

    imegesApiService.totalImagesFound(fetch.data.totalHits);
    renderGallery(fetch.data.hits);

    if (fetch.data.totalHits > imegesApiService.per_page) {
      refs.loadMore.style.display = 'block';
    }

    smoothScrolling();
    lightbox.refresh();
  } catch (error) {
    console.error(error);
  }
}

async function onLoadMore() {
  const { page, per_page } = imegesApiService;

  try {
    const fetch = await imegesApiService.fetchImages();
    renderGallery(fetch.data.hits);
    smoothScrolling();
    lightbox.refresh();
    refs.loadMore.style.display = 'block';

    if (page * per_page > fetch.data.totalHits) {
      imegesApiService.finalyPage();
      refs.loadMore.style.display = 'none';
    }
  } catch (error) {
    console.error(error);
  }
}

arrowTop.onclick = function () {
  window.scrollTo(pageXOffset, 0);
};

window.addEventListener('scroll', function () {
  arrowTop.hidden = pageYOffset < document.documentElement.clientHeight;
});
