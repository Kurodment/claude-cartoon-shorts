# Üretim anayasası (kanal sahibinin kuralları, 2026-11-24)

Bu dosya kanalın ana kural metnidir. SKILL.md bu kuralları motor + Spec akışına çevirir; bir çelişki olursa bu metin
geçerlidir. Altta: her kuralın bizim sistemde nerede uygulandığı.

## Kuralların bizdeki karşılığı
| Bölüm | Kural | Nerede |
|---|---|---|
| 1 | Kalıcı ortak motor, video yalnızca hikâye dosyası ekler | `src/shorts/engine/` (ortak) + `src/shorts/<ad>/spec.ts` (timeline + stage + takes + look + set tek dosyada) + `sound.json` |
| 1 | Motor versiyonu, her video hangi motorla render edildiğini kaydeder | `engine/version.ts`, `engine/CHANGELOG.md`, `render.py final` -> `out/<ad>/final.json` |
| 2 | Ölçümle karar, ~1 sert kesme | `render.py check` -> `camera:` satırı (kesme, geçiş, ortalama çekim, hareket yüzdesi) |
| 2 | -14..-15 LUFS, tepe -2 dBTP, LRA dar | `sound.py` (-14.5 LUFS, <= -2 dBTP), `qa.py` (I / LRA / Peak) |
| 2 | Tek anlatıcı, duygu etiketleri | ElevenLabs kanal sesi; `voice.txt` içinde `[curious]` vb., `voice.py` altyazı için etiketleri siler |
| 2 | Müzik/ortam hiç susmaz, sesin 10-15 dB altında | `sound.py`: chill yatak varsayılan, sesin 13 dB altında (`musicDb`) |
| 2 | Altyazı %70 hizada, 1-3 kelime, beyaz, kontur, ~%3, renklendirme yok | `Captions.tsx` varsayılanı |
| 2 | Dünya içi yazılar | fx `sign` (board / news / tag / label / calendar) |
| 3 | 5 altın kural | SKILL.md bölüm 1 (hook 5-12 kelime, alaycılar, üçleme, önce sonuç, < 0.5 s kapanış) |
| 4 | Uzman ajan ekibi + dosya izolasyonu | SKILL.md "Premium tur" (v1'den sonra, isteğe bağlı: maliyetli) |
| 4 | Turuncu/mavi palet, ışık hikâyeyi takip eder | `light: "day" | "golden" | "night"` her çekimde; sıcak -> gece/kriz -> sıcak |
| 5 | Kesme yerine yolculuk, push-in kelimede, %40 tepe ease | `rc` ease (varsayılan), take planlama, `references/story-camera.md` |
| 5 | Titreme < 1.5 px | `check.ts` JITTER (sert kapı) |
| 5 | Premium ışık (4096 gölge, bloom <= 0.35, eşik >= 0.9, temas gölgesi) | `world.ts` 4096 gölge, `Short.tsx` bloom 0.35 / 0.95, kart temas lekeleri |
| 5 | LOGIC / FLOOR / GRIP / CROP / CAMIN / CAMFACE / OCCL / CAPT / SIZE denetimleri | `check.ts`: OVERLAP, INSIDE, CUT, CAMIN, CAMFACE, HIDDEN, CARD, CAPT, SIZE, JITTER |
| 5 | 0 kritik hata olmadan render yok | `render.py final --spec` sert kapılar; istisna yalnızca `--waive "sebep"` |
| 5 | Yerel hızlı önizleme | `render.py preview` (540x960) |
| 5 | Versiyon arşivi | `render.py final` eskiyi `_vN` olarak saklar |
| 6 | Çizgi film sihri silinmez | SKILL.md yargıç kuralı |
| 6 | Tüm videoyu izle | `render.py preview` -> her 0.5 s'den bir kare, tüm review sayfaları okunur |

Henüz motorda olmayanlar (kalite merdiveninde): eklemli dirsek/diz IK ve el-tutamak GRIP denetimi, mesafeyle
incelen mürekkep, büyük yüzeylerde ±%10 renk varyasyonu, SSAO, dissolve dışında gerçek iki sahneli geçişler.

---

## BÖLÜM 1: MİMARİ KURAL — TEK KULLANIMLIK KOD YERİNE KALICI MOTOR
Asla her yeni video için projenin kopyasını çıkarıp sayıları o hikâyeye özel sabit kodlama. Tek bir kalıcı motor kur
ve geliştirmeleri motora işle. Yeni bir video yalnızca kendi hikâye dosyalarını ekler. Motora eklenen her yeni özellik
genel bir parametre olarak yazılır; motor versiyonlanır (v1 -> v1.1) ve her video hangi motor versiyonuyla render
alındığını kaydederek arşivlenir.

## BÖLÜM 2: CLAUDE'A "GÖZ" VERMEK VE ÖLÇÜM STANDARTLARI
- Her kararı ölçülebilir referans verilerine dayandır. Otomatik ölçüm hızlı kamera hareketlerini kesme sanabilir:
  gerçek değer video başına ~1 sert kesme; geri kalanı kesintisiz kamera yolculuğu.
- Ses: -14 ile -15 LUFS, LRA 1.8-3.5 LU, True Peak -2 dBFS. Tek sabit anlatıcı sesi; kısa replikler aynı sesle.
  Duygu etiketleri: [curious] [deadpan] [conversational] [amused] [excited] [sighs] [mocking] [sad] [mischievously] [confident].
- Müzik ve ortam sesi asla durmaz (%0 sessizlik), seslendirmenin 10-15 dB altında. SFX konuşmanın altına/içine.
- Altyazı: ekranın ~%70 hizasında, kelime senkronlu, 1-3 kelime, kalın beyaz sans-serif, koyu kontur, ~%3 boyut;
  tam cümle yok, emoji yok, kelime renklendirme yok.
- Dünya içi metin: gazete manşetleri, kapı tabelaları, etiketler, takvim yaprakları (GÜN 1 / GÜN 2 / GÜN 3), fiyat tabelaları.

## BÖLÜM 3: SENARYO — 5 ALTIN KURAL (145-247 kelime, 39-65 s)
1. Açılış kancası: yıl veya giriş yok; 5-12 kelimelik tek cümle, çelişki veya tuhaf eylem.
2. Ezilen kahraman vs alay edenler: saçma görünen eylem -> kısa alıntı repliklerle gülme/itiraz -> durum kötüleşir
   ("Bakın" ile açıklama) -> kahraman haklı çıkar, alay edenler bedel öder ya da peşinden koşar.
3. Küçük kesin sayılar (39 fit, 3 yıl, 5 sent), istatistik yok; üçleme ile tırmanma.
4. Önce sonuç, sonra sebep: 1-3 cümlede gündelik bir benzetmeyle mekanizma.
5. Keskin kapanış: son kelimeden 0.1-0.5 s sonra biter; veda yok, "abone ol" yok.

## BÖLÜM 4: UZMAN AJAN EKİBİ VE DOSYA İZOLASYONU
SHAPE (karakter: değişken kontur, köşeli kafalar, eklemler, ter damlası / mor öfke / Zzz / gözyaşı), WORLD (detaylı
çevre, en detaylı şey hikâyenin ana nesnesi), LOOK & PREMIUM (turuncu %18-50 vs mavi %10-28; ışık hikâyeyi takip
eder: sıcak -> kriz anında derin mavi gece/fırtına -> açıklamada tekrar sıcak), CAMERA (en güçlü model). Basit işler
hafif modele, yönetmenlik en güçlü modele. Her ajan yalnızca kendi klasörüne yazar; sonunda birleştirme.

## BÖLÜM 5: YÖNETMEN, IŞIK, DENETLEYİCİLER
- Kesme yalnızca mekân/zaman değişiminde veya punchline'da (~1/video); diğer anlarda kamera karakterden karaktere
  yolculuk eder (0.6-1.0 s, %40 tepe hızlı ease). Kamera karelerin ~%77'sinde hareketli, %10-40/s süzülme. Push-in
  (%53) anahtar kelimenin üzerine. Kareler arası sıçrama < 1.5 px.
- Premium ışık: güneş 35-40°, 4096 gölge haritası, dış mekân kadrajının %20-25'i gölgede; gölgeler soluk mor/erik;
  rim <= 0.9; bloom yalnız gerçek parlak noktalarda (eşik >= 0.9, yoğunluk <= 0.35); temas gölgesi / AO; büyük
  yüzeylerde ±%10 renk varyasyonu; mesafeyle solan konturlar.
- Her kare için sert kapılar: LOGIC (içinden geçme), FLOOR (batma/süzülme), GRIP (el tutamakta mı), CROP / FEET /
  HEADROOM, CAMIN / CAMFACE (< 0.5 m), OCCL / FGBLOCK, CAPT (yüz altyazı altında), SIGN / SIZE (> %80). 0 kritik
  hata olmadan render yok.
- Yerel render (önizleme 540x960 + Full HD), hiçbir versiyon silinmez (V1, V2, ...).

## BÖLÜM 6: YARGIÇ FİLTRESİ VE TAM VİDEO İZLEME
- Çizgi film sihri (sandalyenin arabaya dönüşmesi) asla silinmez; yalnızca izleyicinin gözüne batan gerçek hatalar
  düzeltilir (tutamaktan kopuk el, iç içe insanlar, donup kalan kalabalık).
- Teslimden önce tüm kareleri kapsayan contact sheet'ler ve videonun tamamı incelenir; nihai karar insanındır.
