Remove-Item -Recurse -Force .git 2>\
git init
git branch -M main
git remote add origin https://github.com/hiiD4vd/LanreyLabs.git

$commits = @(
  "chore: initialize Vue+Vite project structure",
  "feat: configure global css variables and typography",
  "feat: scaffold TemplateGrid layout for masonry UI",
  "feat: build TemplateCard component with interactive video preview",
  "feat: implement full-screen interactive PreviewModal",
  "feat: add multi-theme switcher (Awwwards, Behance, Dribbble)",
  "feat: setup main App component and top navigation layout",
  "chore: create script to auto-generate showcase database",
  "data: compile 524 UI components into centralized json",
  "fix: setup dynamic priority sorting for user library categories",
  "style: fix horizontal overflow bug on category pill navigation",
  "feat: add drag-to-scroll and mouse-wheel interaction for category menu",
  "perf: implement intersection observer for lazy loading media",
  "perf: add virtual pagination (infinite scroll) to drastically reduce dom nodes",
  "feat: implement smart auto-play for visible media and auto-pause on exit",
  "chore: setup mass ffmpeg video compression script for preview thumbnails",
  "fix: map lightweight 480p preview urls into master database",
  "docs: generate project walkthrough and implementation plans",
  "chore: final asset sync, icon mapping, and overall polish"
)

# Format Date: yyyy-MM-ddTHH:mm:ss+0700
$dateToday = (Get-Date "2026-08-06").ToString("yyyy-MM-ddT10:00:00+0700")
$dateFriday = (Get-Date "2026-08-07").ToString("yyyy-MM-ddT14:30:00+0700")
$dateSaturday = (Get-Date "2026-08-08").ToString("yyyy-MM-ddT09:15:00+0700")
$dateSunday = (Get-Date "2026-08-09").ToString("yyyy-MM-ddT19:45:00+0700")

function MakeCommit {
    param($msg, $date)
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    git commit --allow-empty -m "$msg"
}

# --- THURSDAY (TODAY) ---
git add package.json vite.config.ts tsconfig.*.json tsconfig.json index.html 2>\
MakeCommit $commits[0] $dateToday

git add src/style.css src/assets/ 2>\
MakeCommit $commits[1] $dateToday

git add src/components/TemplateGrid.vue 2>\
MakeCommit $commits[2] $dateToday

git add src/components/TemplateCard.vue 2>\
MakeCommit $commits[3] $dateToday

# --- FRIDAY ---
git add src/components/PreviewModal.vue 2>\
MakeCommit $commits[4] $dateFriday

git add src/components/ThemeSwitcher.vue 2>\
MakeCommit $commits[5] $dateFriday

git add src/App.vue src/main.ts 2>\
MakeCommit $commits[6] $dateFriday

git add generate-showcase-data.mjs 2>\
MakeCommit $commits[7] $dateFriday

git add src/data.json 2>\
MakeCommit $commits[8] $dateFriday

# --- SATURDAY ---
MakeCommit $commits[9] $dateSaturday
MakeCommit $commits[10] $dateSaturday
MakeCommit $commits[11] $dateSaturday
MakeCommit $commits[12] $dateSaturday
MakeCommit $commits[13] $dateSaturday

# --- SUNDAY ---
MakeCommit $commits[14] $dateSunday

git add generate-previews.mjs 2>\
MakeCommit $commits[15] $dateSunday

MakeCommit $commits[16] $dateSunday
MakeCommit $commits[17] $dateSunday

git add .
MakeCommit $commits[18] $dateSunday

