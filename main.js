const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const playlist = $(".playlist");

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const cd = $(".cd");
const progress = $(".progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const app = {
  currentIndex: 0,
  isPlaying: false,
  song: [
    {
      name: "Lần cuối",
      singer: "Ngọt",
      path: "/music/lanCuoi.mp3",
      image: "/img/lanCuoi.jpg",
    },
    {
      name: "Cho tôi lang thang",
      singer: "Ngọt",
      path: "/music/choToiLangThang.mp3",
      image: "/img/choToiLangThang.jpg",
    },
    {
      name: "Thấy chưa",
      singer: "Ngọt",
      path: "/music/thayChua.mp3",
      image: "/img/thayChua.jpg",
    },
    {
      name: "Em trang trí",
      singer: "Ngọt",
      path: "/music/emTrangTri.mp3",
      image: "/img/emTrangTri.jpg",
    },
  ],
  // ===================== RENDER SONG and SCROLL=========================
  //? REDNER SONG
  render: function () {
    const htmls = this.song
      .map(function (song) {
        return `     <div class="song">
          <div
            class="thumb"
            style="
              background-image: url('${song.image}');
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>`;
      })
      .join("");

    playlist.innerHTML = htmls;
  },
  //? Xử lý việc cuộn lên làm nhỏ lại - SCROLL TOP
  handleEvent: function () {
    // lấy kích thước CD - scrollTop
    const cdWidth = cd.offsetWidth;
    // lấy this (app) tư 1 function con ở trong
    const _this = this;

    //? xử lý cd quay
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, //10s
      iterations: Infinity, // lặp lại bao nhiêu lần ( ở đây vô hạn)
    });

    cdThumbAnimate.pause();

    //? xử lý lăng lên thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      // sử dụng toán tử 3 ngôi để xử lý việc nếu mà kích thước
      // < 0 khi kéo nhanh
      // vẫn có thể nhỏ lại
      cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
      // xử lý việc kéo lên mờ ảnh
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //? PLAY vs PAUSE
    playBtn.onclick = function () {
      // Cách 2:
      // khi bài hát đang chạy
      // nếu mà nó đang false => đang dừng => audio.pause

      if (_this.isPlaying) {
        audio.pause();
        // nếu mà nó đang true => đang chay => audio.play
      } else {
        audio.play();
      }
      // khi bai hat chay
    };
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    // khi bài hát đã dưng
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //? SEEK - khi tiến độ bai hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent =
          Math.floor(audio.duration / 100) * audio.currentTime;
        progress.value = progressPercent;
      }
    };
    // ?tua khi change thanh input range
    progress.onchange = function () {
      audio.currentTime = (progress.value / audio.duration) * 100;
    };

    //? click to next song
    nextBtn.onclick = function () {
      app.nextSong();
      audio.play();
    };
    //? click to previous song
    prevBtn.onclick = function () {
      app.prevSong();
      audio.play();
    };
  },

  // ================= PLAY / PAUSE / SEEK (tua) =====================
  //? Định nghĩa ra 1 thuộc tính cho object
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.song[this.currentIndex];
      },
    });
  },
  // ?load bài hát đầu tiên
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },
  // ==================== NEXT and PRE =====================
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.song.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.song.length - 1;
    }
    this.loadCurrentSong();
  },
  //? PLAY APP
  start: function () {
    // Định nghĩa ra 1 thuộc tính cho object
    this.defineProperties();
    // lắng nghe xử lý các sự kiện
    this.handleEvent();
    // load baif hats hiện tại
    this.loadCurrentSong();
    // seeking

    // render song
    this.render();
  },
};

// mục đích để chỉ gọi 1 thằng app.start không gọi nhiều
app.start();
