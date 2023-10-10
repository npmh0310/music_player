const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "NPMH";

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
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat"); //

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  song: [
    // setConfig: function(key,value){
      
    // },
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
      .map((song, index) => {
        return `     <div class="song ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
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
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
      // if (audio.duration) {
      //   const progressPercent = Math.floor(
      //     (audio.currentTime / audio.duration) * 100
      //   );
      //   progress.value = progressPercent;
      // }
    };
    // ?tua khi change thanh input range
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };
    //? click to next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        app.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    //? click to previous song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        app.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    //? xư lý random bật tất song
    randomBtn.onclick = function () {
      //* Cách 1:
      // if (_this.isRandom) {
      //   _this.isRandom = false;
      //   randomBtn.classList.remove("active");
      // }else {
      // _this.isRandom = true;
      //   randomBtn.classList.add("active");
      //  }
      //
      //* Cách 2:
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle("active", _this.isRandom);
    };
    //? xử lý next song khi audio ended
    audio.onended = function () {
      nextBtn.click();
    };
    //? xử lý repeat
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //? xử lý việc click bài hát vào để chuyên bài hát
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      // xử lý khi click vào song đang chạy thì không được
      if (songNode || e.target.closest(".option")) {
        //xử lý click song đang chạy
        if (songNode) {
          //* get ra index click vao'
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
          // getAttribute("data-index") = dataset.index
        }
        //xử lý click option
        if (e.target.closest(".option")) {
          console.log(123);
        }
      }
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
  // ===================== PLAY RANDOM SONG =================
  playRandomSong: function () {
    let newIndex;
    do {
      // hàm random trong list song
      newIndex = Math.floor(Math.random() * this.song.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  // ========================= SCROLL ACTIVE SONG (hành động lăn lên khi đẩy xuống dưới của list bài hát)  =========================
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  repeatSong: function () {},
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
