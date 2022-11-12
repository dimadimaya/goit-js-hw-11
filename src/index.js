import './css/style.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import ImagesApiService from './js/fetch';

const searchForm = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');
const loadMoreRef = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');

const imagesApiService = new ImagesApiService();

searchForm.addEventListener('submit', onSearch);
// loadMoreRef.addEventListener('click', onLoadMore);

loadMoreRef.classList.add('is-hidden');

function onSearch(event) {
  event.preventDefault();
  clearHitsContainer();
  imagesApiService.searchQuery =
    event.currentTarget.elements.searchQuery.value.trim();
  imagesApiService.resetPage();
  if (imagesApiService.searchQuery === '') {
    Notiflix.Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    return;
  }
  imagesApiService.fetchHits().then(({ data }) => {
    // console.log(data.total);
    if (data.total === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images`);
    appendMarckup(data);
    loadMoreRef.classList.remove('is-hidden');
    lightbox.refresh();
  });
}

window.addEventListener('scroll', () => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
  if (scrollHeight - clientHeight === scrollTop) {
    imagesApiService.fetchHits().then(({ data }) => {
      const totalPages = Math.ceil(data.totalHits / imagesApiService.perPage);
      if (imagesApiService.page > totalPages) {
        loadMoreRef.classList.add('is-hidden');
        Notiflix.Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
      }
      appendMarckup(data);

      lightbox.refresh();
    });
  }
});

// function onLoadMore() {
//   imagesApiService.fetchHits().then(({ data }) => {
//     const totalPages = Math.ceil(data.totalHits / imagesApiService.perPage);
//     if (imagesApiService.page > totalPages) {
//       loadMoreRef.classList.add('is-hidden');
//       Notiflix.Notify.info(
//         `We're sorry, but you've reached the end of search results.`
//       );
//     }
//     appendMarckup(data);

//     lightbox.refresh();
//   });
// }

function appendMarckup(data) {
  galleryRef.insertAdjacentHTML('beforeend', createMarckup(data));
}

function createMarckup({ hits }) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
  <div class="photo-card">
  <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>
  `
    )
    .join('');
}

function clearHitsContainer() {
  galleryRef.innerHTML = '';
}
