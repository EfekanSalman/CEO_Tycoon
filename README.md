# Silikon Garaj

Türkçe/İngilizce teknoloji şirketi yönetim oyunu (tek sayfa).

- `node tools/build.js --check` — `src/` parçalarından `index.html` derler (sözdizimi ve üst düzey tanım çakışması denetimiyle).
- `node test/suite.js --build` — derleyip bütün testleri koşturur.
- `node tools/bal/bal.js <senaryo> <strateji> <yıl> [html] [tohum]` — denge botu (tek koşu, JSON çıktı).
- `node tools/bal/bench.js --a A.html --stratB base,pat ...` — eşleştirilmiş karşılaştırmalı ölçüm.

Kaynak, 2026-11-18'de çalışma ortamı yenilenip proje kaybolunca yayınlanmış v165'ten geri çıkarıldı
(`tools/extract.py`, `tools/v165-published.html`); derleme çıktısı v165 ile birebir aynıdır.
Metinler kaynakta iki dillidir: `(LANG_EN?"English":'Türkçe')`. Yeni metin eklerken bu biçimi kullan.
