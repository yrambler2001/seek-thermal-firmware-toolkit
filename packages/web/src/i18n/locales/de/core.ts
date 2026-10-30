/**
 * Namespace `core`, Deutsch (de), translated from the English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}`, `{masks}`, `{files}`, `{sites}`, `{places}`,
 *     `{context}`, `{notes}` (joined with your common:list.* words; where the
 *     English uses a semicolon, common:list.semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { Translation } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'die Kamera bleibt entsperrt, bis sie aus- und wieder eingeschaltet wird, und andere Programme lesen sie bis dahin womöglich falsch; schalten Sie sie aus und wieder ein, bevor Sie diese verwenden',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} zuerst, dann {second}, dann {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'wurde nicht gelesen',
  'boot.verdict.checkKeyUnnamed':
    'konnte nicht geprüft werden: Der Schlüssel, unter dem sein Bootloader einen Slot prüft, wurde nicht benannt',
  'boot.cfg0NotRead':
    'das Boot-Konfigurationswort (cfg[0]) wurde nicht gelesen, daher ist nicht bekannt, aus welchem Slot der nächste Start erfolgt',
  'boot.select.unknown':
    'das Boot-Konfigurationswort ist {word}, daher probiert der Bootloader zuerst {first}, aber {bank} {verdict}, daher ist nicht bekannt, welcher Slot läuft',
  'boot.select.first':
    'das Boot-Konfigurationswort ist {word}, daher probiert der Bootloader zuerst {first}, und dieser Slot enthält ein Image, das der Bootloader annimmt',
  'boot.select.second':
    'das Boot-Konfigurationswort ist {word}, daher probiert der Bootloader zuerst {first}; {first} enthält kein Image, das der Bootloader annimmt, daher nimmt er {second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'das Boot-Konfigurationswort ist {word}, daher probiert der Bootloader zuerst {first}; weder {first} noch {second} enthält ein Image, das der Bootloader annimmt, daher startet er {last}, den er nicht prüft',
  'boot.select.lastTakes':
    'das Boot-Konfigurationswort ist {word}, daher probiert der Bootloader zuerst {first}; weder {first} noch {second} enthält ein Image, das der Bootloader annimmt, daher nimmt er {last}, den er nicht prüft',
  'boot.bootsNow': '{bank} ist der Slot, aus dem die Kamera jetzt startet',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'jetzt gestartet',
  'boot.notBooted': 'nicht gestartet',
  'boot.unknownWhy.checkKeyUnnamed':
    'der Schlüssel, unter dem sein Bootloader einen Slot prüft, wurde bei diesem Lesen nicht benannt',
  'boot.unknownWhy.noKeyTable':
    'die Schlüsseltabelle des Bootloaders wurde nicht gelesen, daher lassen sich die Schlüssel, die er probiert, nicht benennen',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Die Kamera startet aus {bank}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} enthält einen Bildraten-Patch, läuft aber nicht, daher wirkt der Patch nicht.',
  'fpsBoot.holdsTwo':
    '{banks} enthalten Bildraten-Patches, aber keiner von beiden läuft, daher wirken die Patches nicht.',
  'fpsBoot.wouldNotRun':
    'Wird {target} gepatcht, läuft er dadurch nicht, weil die Kamera stattdessen aus {bank} startet.',
  'fpsBoot.patchRunning':
    'Patchen Sie auch {bank} (den Slot, der läuft): Erst das lässt den Bildraten-Patch wirken.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} kann hier nicht gepatcht werden ({reason}), daher wirkt ein Bildraten-Patch in einem anderen Slot auf dieser Kamera nicht.',

  /* ---- backup: the zip saved before a bank write (slots/backup) ---- */
  'backup.bank.notInPlan': '{name} (nicht im Plan dieses Builds: die ZIP-Datei vermerkt das)',
  'backup.bank.unsupported':
    '{name} (dieser Build kann ihn nicht lesen, {reason}: die ZIP-Datei vermerkt das)',
  'backup.bank.empty':
    '{name} (leer, jedes Byte 0xFF: die ZIP-Datei vermerkt das, und der Schreibvorgang überschreibt keine Firmware)',
  'backup.bank.unread':
    '{name} (das Lesen der Slots hat ihn nicht erreicht: die ZIP-Datei vermerkt, ob das Lesen vor dem Schreiben ihn erreicht)',
  'backup.bank.noKey':
    '{name} (wie gespeichert; kein Schlüssel aus diesem Lesen öffnet ihn, daher gibt es keine entschlüsselte Datei)',
  'backup.bank.decrypted': '{name} (wie gespeichert und entschlüsselt)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Bevor irgendetwas geschrieben wird, wird {banks} erneut gelesen und in einer ZIP-Datei gespeichert, mit einer Notiz, was jede Datei ist: {file}.',
  'backup.plan.many':
    'Bevor irgendetwas geschrieben wird, werden {banks} erneut gelesen und in einer ZIP-Datei gespeichert, mit einer Notiz, was jede Datei ist: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'so verschlüsselt, dass das Gerät es unter dem Schlüssel speichert, den der gestartete Slot enthält',
  'staging.detail.slotKeystreamCiphertext':
    'verschlüsselt unter dem eigenen Übertragungsschlüssel des Images (Schlüsselblock 0); die Kamera speichert es unter dem eigenen Schlüssel des Slots',
  'staging.detail.plain': 'Klartext, ohne Verschlüsselung',
  'staging.detail.keyAKeystream':
    'das 1.3.0.8-FF-Image so, wie die Hersteller-App es überträgt (XOR Schlüssel A) — der 16-Hz-Build speichert es unter Schlüssel B, nicht diese Bytes',
  'staging.detail.verbatim': 'unverändert — die Bytes genau wie angegeben',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'kein Lesevorgang',
  'copy.source.notInPlan': '{name} ist nicht im Plan dieses Builds',
  'copy.source.notRead':
    '{name} wurde nicht gelesen ({reason}), daher gibt es kein Image zum Kopieren',
  'copy.source.empty': '{name} ist leer: Es gibt kein Image zum Kopieren',
  'copy.source.foreign':
    '{name} enthält kein Firmware-Image, das dieses Lesen erkennt, daher gibt es nichts zu kopieren',
  'copy.source.noKey':
    'kein Schlüssel aus diesem Lesen öffnet {name}, daher gibt es kein entschlüsseltes Image zum Kopieren',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} bei {address}, wie das Lesen der Slots es entschlüsselt hat',
  'copy.fromVersion':
    '{name} bei {address}, Firmware {version}, wie das Lesen der Slots es entschlüsselt hat',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Das Image stammt aus {name}, wie das Lesen der Slots es entschlüsselt hat: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Das Image stammt aus {name}, wie das Lesen der Slots es entschlüsselt hat: Firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's Slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} der Sicherung (bei {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} in der vollständigen Flash-Sicherung {file}',
  'restore.fromVersion': '{where} in der vollständigen Flash-Sicherung {file}, Firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'ein 4-MB-Flash-Abbild',
  'restore.kind.preserve-run': 'eine Preserve-Durchlaufdatei',
  'restore.kind.dump': 'eine ZIP-Datei von „Auslesen & entschlüsseln 4.x/Nano“',
  'restore.kind.all-selectors': 'eine ZIP-Datei von „Alle Selektoren auslesen“',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'ein Image',
  'restore.decryptedTo.firmware': 'Firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Das Image ist {where} in {file}, {kind}: gespeichert mit sha256 {stored}, entschlüsselt ergibt es {decrypted} mit {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Das Image ist {where} in {file}, {kind} (darin {entry}): gespeichert mit sha256 {stored}, entschlüsselt ergibt es {decrypted} mit {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Nach dem Schreiben wird der zurückgelesene Slot mit den gespeicherten Slot-Bytes der Sicherung verglichen.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Der Identitätsblock der Sicherung nennt diese Kamera (Seriennummer {serial}).',
  'restore.note.sameBytes':
    '{name} enthält bereits die gespeicherten Bytes der Sicherung: Der Schreibvorgang schreibt dasselbe Image zurück.',
  'restore.warn.otherCamera':
    'Diese Sicherung sieht nach einer anderen Kamera aus: Ihr Identitätsblock nennt die Seriennummer {theirs}, und diese Kamera ist {camera}. Geschrieben wird nur das Image von {name}; nichts von der Identität oder Kalibrierung jener Kamera.',
  'restore.warn.noIdentity':
    'Diese Sicherung hat keinen Identitätsblock bei {address}, daher lässt sich nicht sagen, von welcher Kamera sie gelesen wurde.',
  'restore.warn.serialNotRead':
    'Die Seriennummer der Kamera wurde nicht gelesen, daher kann die Sicherung (Seriennummer {serial}) ihr nicht zugeordnet werden.',
  'restore.warn.otherFirmware':
    '{where} enthält Firmware {version}, und die Kamera führt {camera} aus: Die Wiederherstellung bringt eine andere Firmware in den Slot.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} wurde nicht zurückgelesen und daher nicht mit der Sicherung verglichen.',
  'restore.readBack.equal':
    '{bank} liest sich Byte für Byte so zurück, wie die Sicherung ihn speichert.',
  'restore.readBack.differs':
    '{bank} liest sich in {count} B anders zurück als die gespeicherten Bytes der Sicherung (erste Abweichung bei {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, abgeleitet vom gestarteten {bank}',
  'keys.derived.holds':
    '{key} (der Speicherschlüssel), abgeleitet vom gestarteten {bank}, der {holds} enthält',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, abgeleitet vom gestarteten Slot',
  'keys.derived.holdsUnnamed':
    '{key} (der Speicherschlüssel), abgeleitet vom gestarteten Slot, der {holds} enthält',
  'keys.ffVendor.staged':
    'das 1.3.0.8-FF-Image (16 Hz) so, wie die Hersteller-App es überträgt: das Image XOR seinen eigenen Schlüsselblock 0 (Schlüssel A), Header-Fenster unverändert, in jeden Slot; die Schlüssel dieser Kamera werden nicht verwendet',
  'keys.ffVendor.stored':
    'Schlüssel B: Die Kamera verschlüsselt den Upload mit Schlüsselblock 1 neu und speichert das Image darunter',
  'keys.imageBlock0.staged':
    'das Image unter seinem eigenen Schlüsselblock 0 (im Image anhand des Werts gefunden), in jeden Slot; die Schlüssel dieser Kamera werden nicht verwendet',
  'keys.imageBlock0.storedUnnamed':
    'der Schlüssel, unter dem ihr Bootloader einen Slot prüft (bei diesem Lesen nicht benannt); die Kamera verschlüsselt den Upload darunter neu',
  'keys.imageBlock0.stored':
    '{key}, der Schlüssel, unter dem ihr Bootloader einen Slot prüft; die Kamera verschlüsselt den Upload darunter neu',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (ungetestet): Von einer Kamera wurde noch kein Bootloader des 16-Hz-FF-Builds gelesen, daher ist nicht bekannt, ob der beschriebene Slot startet. Auf dem Bootloader 0.9.0.0 ist eine frühere Form dieses Images aus Recovery-Slot R gestartet; diese Form wird das nicht, weil dieser Bootloader Recovery-Slot R so startet, wie er gespeichert ist, ohne ihn zu dekodieren.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Das 16-Hz-FF-Image wird in der Form gesendet, die nur der 16-Hz-Build {version} liest. Diese Kamera beschreibt einen Slot, ohne das Image zu prüfen (ihr Firmware-Quelltext sagt das, und eine Compact mit 1.3.0.0 tat das beim Versuch), daher wird erwartet, dass sie die Bytes so schreibt, wie sie gesendet werden: Der Slot enthält das Image dann in einer Form, aus der diese Kamera nicht starten kann.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nichts hier behauptet, dass die Kamera es startet.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Die eigenen Antworten der Kamera sagen, dass sie den 16-Hz-FF-Build ausführt: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'prüft Nutzdaten, bevor er einen Slot löscht, und diese Nutzdaten bestehen die Prüfung. Er schreibt diese Bytes also womöglich so, wie sie sind, in einer Form, aus der sein Bootloader nicht starten kann: Der Slot startet dann womöglich nicht (nicht ausprobiert; die vor dem Schreiben gespeicherte Sicherung stellt ihn wieder her)',
  'write.ff.outcome.refuses':
    'prüft Nutzdaten, bevor er einen Slot löscht, und diese Nutzdaten bestehen die Prüfung nicht. Es wird also erwartet, dass er diesen Schreibvorgang ablehnt, bevor er irgendetwas schreibt (eine Kamera mit diesem Build hat eine frühere Form dieses Images auf dieselbe Weise abgelehnt)',
  'write.ff.runsSlow':
    'Die Kamera führt den 8-Hz-Build {version} aus: {why}. Dieser Build {outcome}.',
  'write.ff.buildUnknown':
    'Die eigenen Antworten der Kamera sagen nicht, welchen Build {version} sie ausführt: {why}. Führt sie den 16-Hz-FF-Build aus, nimmt sie diese Nutzdaten an. Führt sie den 8-Hz-Build aus, gilt: Dieser Build {outcome}.',
  'write.raw.asGiven':
    'Rohe Nutzdaten: genau wie angegeben gesendet. Nichts hier prüft, ob sie startfähig sind.',
  'write.raw.ffStagedForm':
    'Diese Nutzdaten sind die übertragene Form von 1.3.0.8 FF (das Image XOR Schlüsselblock 0, Wortsumme 0xFFFF). Die Kamera speichert das Image unter Schlüssel B, daher wird das Rücklesen gegen diese Bytes geprüft.',
  'write.raw.noStaging':
    'Dieser Build nennt keine Übertragungsform für den Slot, daher lassen sich die Prüfungen des Bootloaders nicht angeben.',
  'write.raw.reencrypts':
    'Das Gerät dekodiert diese Nutzdaten und verschlüsselt neu, was es behält, daher sind die gespeicherten Bytes nicht vorhergesagt. Das Rücklesen wird, wo das möglich ist, als das Image geprüft, zu dem es sich entschlüsseln lässt.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Der Bootloader würde diese Nutzdaten ablehnen: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Der Übertragungsschlüssel von 2016 (Schlüsselblock 0) ist in Rohdaten nicht enthalten, daher wird die entschlüsselte Wortsumme dieser Nutzdaten hier nicht geprüft.',
  'write.image.rekeyRisk':
    '{name} enthält bereits ein Image, das der Bootloader nicht annehmen kann. Dieser Schreibvorgang führt zum selben Zustand.',
  'write.ack.recovery':
    'Recovery-Slot R: Das Schreiben verlangt, dass Sie das Risiko bestätigen. Nichts hier prüft, ob die Kamera danach startet.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: Das Schreiben verlangt, dass Sie das Risiko bestätigen, und die Kamera führt nach dem nächsten Aus- und Einschalten aus, was immer dieser Slot dann enthält.',
  'write.ack.bootUnnamed':
    'der gestartete Slot konnte nicht benannt werden, daher wird dieser als der gestartete behandelt',
  'write.ack.recoveryFallback':
    'Recovery-Slot R ist die letzte Rückfallkopie, auf die der Bootloader zurückgreift',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'leer/0: Slot A bevorzugt, dann B, dann Recovery',
  'boot.cfg0.modernB': 'Slot B bevorzugt, dann A, dann Recovery',
  'boot.cfg0.modernRecovery': 'Recovery bevorzugt, dann A, dann B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'unbekannt — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  'upgrade.targetBooted':
    '{name} ist sowohl der Slot, aus dem die Kamera gestartet ist, als auch der Slot, in den ihr eigenes Upgrade schreibt. Ein Upgrade, das von dieser Kamera aus läuft, würde das Image überschreiben, das sie gerade ausführt. Das ist nur eine Warnung: Nichts hier verhindert ein Upgrade.',
  /** `{verdict}` is one of upgrade.verdict.*. */
  'upgrade.whileRecovery':
    'Die Kamera läuft aus ihrem Recovery-Slot, und ihr eigenes Upgrade schreibt in {name}, aus dem sie nicht läuft. {verdict} Das ist nur eine Warnung: Nichts hier verhindert ein Upgrade.',
  'upgrade.verdict.notRead':
    '{name} konnte bei dieser Prüfung nicht gelesen werden, daher ist nicht bekannt, was er enthält.',
  'upgrade.verdict.blank': '{name} ist leer, das Upgrade schreibt also in einen leeren Slot.',
  'upgrade.verdict.bootableSame':
    '{name} enthält dasselbe startfähige Image wie der Slot, aus dem sie läuft, und das Upgrade ersetzt es; bricht das Upgrade mittendrin ab, bleibt {name} startunfähig zurück.',
  'upgrade.verdict.bootable':
    '{name} enthält ein startfähiges Image, das das Upgrade ersetzt; bricht das Upgrade mittendrin ab, bleibt {name} startunfähig zurück.',
  'upgrade.verdict.unknown':
    'Ob {name} startfähig ist, ist bei diesem Lesen unbekannt, das Upgrade ersetzt also womöglich ein Image, aus dem die Kamera starten würde.',
  'upgrade.verdict.notBootable':
    '{name} wird bei diesem Lesen nicht als startfähig angezeigt, das Upgrade ersetzt also kein Image, aus dem die Kamera starten würde.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — der Slot, den der Bootloader bei diesem Start angesprungen hat, wie er es festhält',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nicht gelesen',
  'report.lastStart.noBank': 'die Kamera meldet {word}, was keinen Slot bezeichnet',
  'report.lastStart.entered':
    'die Kamera meldet, dass sie aus {bank} gestartet ist (Aktiv-Slot-Wort {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'keine Version',
  'running.why.otherVersion': 'die Kamera meldet {version}, und nur {only} gibt es in zwei Builds',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'die Kamera hat die Slot-Urteile nicht beantwortet (GetFirmwareInfo-Selektoren 6, 7, 8)',
  'running.why.notRead':
    'ein Slot, von dem die Urteile abhängen, wurde nicht gelesen, daher lassen sich die Antworten nicht vorhersagen',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'die Kamera antwortet {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, was der 8-Hz-Build 1.3.0.8 für diese Slots antwortet ({predicted})',
  'running.why.ff':
    '{answers}, was der 16-Hz-FF-Build 1.3.0.8 für diese Slots antwortet ({predicted})',
  'running.why.both':
    '{answers}, und beide Builds antworten für diese Slots genau so, die Slots unterscheiden sie also nicht',
  'running.why.neither':
    '{answers}, was zu keinem der beiden Builds passt (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Der Header dieses Images nennt keine Firmware-Version, daher lässt sich nicht sagen, ob es der Build ist, den die Kamera ausführt ({camera}). Prüfen Sie, ob es das Image ist, das Sie schreiben wollen.',
  'imageBuild.otherVersion': 'Dieses Image ist Firmware {image}; die Kamera führt {camera} aus.',
  'imageBuild.otherVersionTaken':
    'Dieses Image ist Firmware {image}; die Kamera führt {camera} aus. Auf dieser Firmware-Linie prüft die Kamera nur, ob ein Image wohlgeformt ist (Header und Wortsumme), nicht seine Version. Sie nimmt dieses Image also an, und wenn sie aus diesem Slot startet, führt sie {image} aus.',
  'imageBuild.otherVersionUnchecked':
    'Dieses Image ist Firmware {image}; die Kamera führt {camera} aus. Ob diese Kamera einen anderen Build annimmt und ausführt, wurde nicht geprüft.',
  'imageBuild.otherBuild':
    'Dieses Image ist der 8-Hz-Build {version}; die Kamera führt den 16-Hz-FF-Build {version} aus. Der 16-Hz-Build prüft Nutzdaten beim Commit gegen seine eigene FF-Form und lehnt solche, die durchfallen, ab, bevor er den Slot löscht (laut seinem Quelltext). Den 8-Hz-Build darauf zu schreiben wurde an keiner Kamera ausprobiert.',
  'imageBuild.runningUnknown':
    'Dieses Image ist der 8-Hz-Build {version}. Die Kamera führt {version} aus, das es als 8-Hz- und als 16-Hz-FF-Build gibt, und ihre eigenen Antworten haben nicht gesagt, welchen sie ausführt. Daher lässt sich nicht sagen, ob dies ihr Build ist.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'die Nutzdaten sind {size} B groß, zu kurz für einen Header bei 0x200',
  'bootFail.noMagic':
    'kein Image-Magic bei 0x200 (gefunden {found}, der Bootloader braucht {needs})',
  'bootFail.lengthOutside': 'header.length {length} liegt außerhalb der Nutzdaten von {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} ist nicht die Länge der Nutzdaten, {size}',
  'bootFail.overStage': '{size} B überschreitet die Übertragungsgrenze von {max} B',
  'bootFail.plainSum': 'gespeicherte Wortsumme {sum}, der Bootloader von 2014 braucht 0',
  'bootFail.noFooter': 'kein Footer bei {offset}: die Nutzdaten enden bei {end}',
  'bootFail.footerNotCode':
    'der Footer bei {offset} ist nicht „CODE“ — der Bootloader nimmt seinen segmentierten Loader',
  'bootFail.footerLength': 'die Footer-Länge ist nicht gleich header.length {length}',
  'bootFail.keyASum':
    'unter Schlüssel A dieser Kamera entschlüsselt ist die Wortsumme {sum}, der Bootloader braucht {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'durch die Prüfsumme bestätigt',
  'keyConfidence.structural': 'nur durch die Vektortabelle bestätigt',
  'keyConfidence.unverified': 'nicht bestätigt',
  /** `{sum}` is hex. */
  'keyCheck.family': 'Schlüssel durch die Prüfsumme {sum} bestätigt',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'Schlüssel {phrase}; Prüfsumme {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'unter den eigenen Schlüsseln der Kamera übertragen',
  'staging.phrase.slotKeystreamCiphertext': 'unter dem eigenen Schlüssel des Images übertragen',
  'staging.phrase.plain': 'unverschlüsselt übertragen',
  'staging.phrase.keyAKeystream':
    'so übertragen, wie die Hersteller-App das FF-Image überträgt (XOR Schlüssel A)',
  'staging.phrase.verbatim': 'wie angegeben gesendet',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank (label form); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    '{size} B per Commit in {name} bei {address} geschrieben, {staged}; Commit-Status {status}',
  'written.noReadWindow':
    'dieser Build nennt kein Lesefenster für den Slot, daher wurde nichts zurückgelesen',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'das Rücklesen ist fehlgeschlagen: {error}',
  'written.readBack': '{size} B zurückgelesen, SHA-256 {sha256}',
  'written.verifyOff': 'Prüfen ist ausgeschaltet: Der Slot wurde nicht zurückgelesen',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'den Bytes, die der Plan für den Slot vorhergesagt hat (das Image so, wie der 16-Hz-Build es speichert, nicht die gesendeten Bytes)',
  'readBack.reference.asSent':
    'den Bytes, die der Plan für den Slot vorhergesagt hat (die Bytes so, wie sie gesendet wurden)',
  'readBack.sizeDiffers':
    'die zurückgelesenen Daten sind {size} B groß, der Plan hat {predictedSize} B vorhergesagt: Der Slot stimmt NICHT überein mit {reference}',
  'readBack.matchesFolded':
    'der Slot enthält das Image so, wie der 16-Hz-Build es speichert (nicht die gesendeten Bytes), und der Rest des Slots ist gelöscht',
  'readBack.matches':
    'der Slot stimmt mit den vom Plan vorhergesagten Bytes überein (die Klartext-Kette von 2014 programmiert genau das, was sie gesendet bekommt)',
  'readBack.differs':
    'der Slot stimmt NICHT überein mit {reference} (erste Abweichung bei {offset})',
  'readBack.noHeader':
    'die zurückgelesenen Daten enthalten keinen Image-Header bei {offset} (Magic {magic}), daher entschlüsselt sich der Slot NICHT zum erwarteten Image',
  'readBack.lengthDiffers':
    'der Header der zurückgelesenen Daten nennt {length} B, das Image des Plans hat {imageLength} B: Der Slot entschlüsselt sich NICHT zum erwarteten Image',
  'readBack.tooShort':
    'die zurückgelesenen Daten sind {size} B groß, zu kurz für ein Image mit {length} B: Der Slot entschlüsselt sich NICHT zum erwarteten Image',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'aus den zurückgelesenen Daten gewonnenen Schlüsselstrom ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts':
    'der Slot entschlüsselt sich mit dem {recovered} zum erwarteten Image ({length} B)',
  'readBack.decryptDiffers':
    'der Slot entschlüsselt sich NICHT zum erwarteten Image: erste Abweichung bei Image-Offset {offset}, mit dem {recovered}',
  'readBack.rawNotCompared':
    'Rohdaten: Rücklesen gemeldet, nicht verglichen (die Bytes entschlüsseln sich in dieser Form nicht zu einem vorhersagbaren Klartext-Image, und das Gerät verschlüsselt neu, was es behält)',
  'readBack.notCompared':
    'kein Vergleich möglich: Der Plan sagt weder die gespeicherten Bytes noch das Klartext-Image vorher',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'Schlüssel A',
  'keyName.keyB': 'Schlüssel B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'Geräteschlüssel',
  'keyName.thePerDevice': 'der Geräteschlüssel',
  'keyName.applicationKeyA': 'Schlüssel A der Anwendung',
  'keyName.applicationKeyB': 'Schlüssel B der Anwendung',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'Schlüsselblock 1',
  'keyName.theDeviceKey': 'der Geräteschlüssel',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'unbekannter Schlüssel',
  'keys.noKnownKey': 'kein bekannter Schlüssel',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'die Klartext-Kette von 2014: Jeder Slot ist im Klartext gespeichert, daher wird kein Upload-Schlüssel abgeleitet; der Upload ist das Image, wie es ist',
  'keys.evidence.ffVendor':
    'der 1.3.0.8-FF-Build (16 Hz): Kein Slot, den dieses Lesen geöffnet hat, ist im Klartext gespeichert, daher ist nicht gezeigt, dass die Kamera auf der Klartext-Kette von 2014 ist; das FF-Image wird in seiner Hersteller-Form geschrieben, Rohdaten werden wie angegeben gesendet, und ein 8-Hz-Klartext-Image wird nicht geschrieben',
  'keys.evidence.ffUntested':
    'ein Schreiben des FF-Images wird mit seiner UNTESTED-Warnung angeboten: Für diesen Build liegt kein echter Bootloader in der Sammlung vor, daher ist nicht gemessen, ob der beschriebene Slot startet',
  'keys.evidence.line2016':
    'die Compact-PRO-Linie von 2016: Ein Upload ist das Image XOR den Schlüsselstrom seines eigenen Schlüsselblocks 0, der im Image anhand des Werts gefunden wird, daher baut ihn kein Schlüssel dieser Kamera',
  'keys.evidence.checkKeyUnnamed':
    'die Kamera entschlüsselt den Upload mit diesem Schlüssel und verschlüsselt ihn neu unter dem Schlüssel, unter dem ihr Bootloader einen Slot prüft; dieser Schlüssel wurde bei diesem Lesen nicht benannt, und der Schreibvorgang braucht ihn nicht: Der Slot wird als das Image zurückgelesen, zu dem er sich entschlüsselt',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'die Kamera entschlüsselt den Upload mit diesem Schlüssel und verschlüsselt ihn neu unter dem Schlüssel, unter dem ihr Bootloader einen Slot prüft; dieser Schlüssel wurde bei diesem Lesen nicht benannt ({why}), und der Schreibvorgang braucht ihn nicht: Der Slot wird als das Image zurückgelesen, zu dem er sich entschlüsselt',
  'keys.evidence.checkKeyNamed':
    'die Kamera entschlüsselt den Upload mit diesem Schlüssel und verschlüsselt ihn neu unter {key} {hex}, dem Schlüssel, unter dem ihr Bootloader einen Slot prüft, daher wird jeder Slot, den sie schreibt, so gespeichert, wie der Bootloader ihn annimmt',
  'keys.evidence.checkKeyInferred':
    'die Kamera entschlüsselt den Upload mit diesem Schlüssel und verschlüsselt ihn neu unter {key} {hex}, dem Schlüssel, unter dem ihr Bootloader einen Slot prüft (erschlossen aus {bank}, dem Slot, aus dem die Kamera laut eigener Meldung gestartet ist und den der Bootloader ohne seine Prüfung angesprungen hat), daher wird jeder Slot, den sie schreibt, so gespeichert, wie der Bootloader ihn annimmt',
  'keys.evidence.checkKeyNamedFrom':
    'die Kamera entschlüsselt den Upload mit diesem Schlüssel und verschlüsselt ihn neu unter {key} {hex}, dem Schlüssel, unter dem ihr Bootloader einen Slot prüft (benannt anhand von {bank}, dem Slot, aus dem die Kamera laut eigener Meldung gestartet ist), daher wird jeder Slot, den sie schreibt, so gespeichert, wie der Bootloader ihn annimmt',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'die laufende Anwendung ({bank}, Firmware {firmware}) trägt ihren Schlüssel A {keyA} bei {keyAAt}, aus {source}',
  'keys.evidence.applicationKeys':
    'die laufende Anwendung ({bank}, Firmware {firmware}) trägt ihren Schlüssel A {keyA} bei {keyAAt}, aus {source}, und ihren Schlüssel B {keyB} bei {keyBAt}',
  'keys.source.keyTable': 'der Schlüsseltabelle des Bootloaders',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'dem dekodierten Anwendungspaar von {builds}',
  'keys.evidence.perDevice':
    'ein Geräteschlüssel ist programmiert, daher verschlüsselt die Anwendung unter ihm neu',
  'keys.evidence.noPerDevice':
    'es ist kein Geräteschlüssel programmiert, daher verschlüsselt die Anwendung unter ihrem eigenen Schlüssel B neu',
  'keys.evidence.storeKey':
    'der Speicherschlüssel der Anwendung ist {key} des Bootloaders ({hex}), daher speichern die Schreibvorgänge jeden Slot darunter; im gestarteten {bank} liegt {held}, was der Bootloader ebenfalls annimmt',
  'keys.evidence.bootedKey':
    'der gestartete {bank} entschlüsselt sich unter {key} ({hex}), einem Schlüssel, den der Bootloader probiert; der Speicherschlüssel der Anwendung ist nicht der des Bootloaders, daher speichern die Schreibvorgänge jeden Slot unter dem Schlüssel des gestarteten Slots',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'der Upload ist das Image XOR die Schlüsselströme von {masks}; das Gerät speichert das Image unter {key}',
  /** `{held}` is a key name or keys.noKnownKey. */
  'keys.evidence.otherBank':
    'zu {bank} passt {held}; er wird nach derselben Regel unter {key} geschrieben und zur Prüfung zurückgelesen',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'der gestartete Slot konnte nicht benannt werden, daher lässt sich daraus nicht lesen, unter welchem Schlüssel der Slot gespeichert ist',
  'keys.refused.notDerived': 'die Schlüssel konnten nicht abgeleitet werden',
  'keys.refused.notDecrypted':
    'der gestartete {bank} entschlüsselt sich nicht zu einem Image, daher lässt sich der Schlüssel, unter dem er gespeichert ist, nicht lesen',
  'keys.refused.noBootKey':
    'der gestartete {bank} entschlüsselt sich unter keinem Schlüssel, den der Bootloader probiert (seinem Schlüssel A oder seinem Speicherschlüssel), daher lässt sich daraus nicht lesen, unter welchem Schlüssel der Slot gespeichert ist',
  'keys.refused.keyNotInTable':
    'der gestartete {bank} entschlüsselt sich unter {key}, aber die Schlüsseltabelle dieser Kamera enthält diesen Schlüssel nicht, daher kann nicht darunter geschrieben werden',
  'keys.refused.noApplicationPair':
    'die laufende Anwendung ({bank}, Firmware {firmware}) enthält keines der bekannten Schlüsselpaare (das des Bootloaders und die dekodierten Anwendungspaare) mit jeder Hälfte genau einmal, daher lässt sich ihr Schlüssel A in ihrem Image nicht finden',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'die laufende Anwendung ({bank}, Firmware {firmware}) enthält keines der bekannten Schlüsselpaare (das des Bootloaders und die dekodierten Anwendungspaare) mit jeder Hälfte genau einmal, daher lässt sich ihr Schlüssel A in ihrem Image nicht finden (Schlüssel A des Bootloaders kommt {count}-mal vor, sein Schlüssel B {keyB}-mal)',
    other:
      'die laufende Anwendung ({bank}, Firmware {firmware}) enthält keines der bekannten Schlüsselpaare (das des Bootloaders und die dekodierten Anwendungspaare) mit jeder Hälfte genau einmal, daher lässt sich ihr Schlüssel A in ihrem Image nicht finden (Schlüssel A des Bootloaders kommt {count}-mal vor, sein Schlüssel B {keyB}-mal)',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'die laufende Anwendung ({bank}, Firmware {firmware}) prüft einen Upload unter ihren eigenen Schlüsseln, bevor sie ihn programmiert (der dekodierte Quelltext dieses Builds probiert den Upload unter ihrem Schlüssel A und ihrem Speicherschlüssel, so wie ihr Bootloader einen Slot probiert), und der Schlüssel, unter dem die Schreibvorgänge speichern, {key} ({hex}), ist weder ihr Schlüssel A noch ihr Speicherschlüssel, daher würde die Kamera den Upload mit 0x50000 ablehnen, bevor sie irgendetwas löscht',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum': 'kein Slot entschlüsselt sich zur Prüfsumme {sum} von {family}',
  'writeRefusal.keyTable': 'die Schlüsseltabelle dieser Kamera konnte nicht bestätigt werden',
  'writeRefusal.whitening':
    'die Schlüsseltabelle dieser Kamera löst sich unter K={k} auf, aber {family} verschlüsselt unter K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'die Hinweise sagen, dass diese Kamera {detected} ist, nicht {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'diese Kamera kann von hier aus nicht beschrieben werden: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Die Builds von Seek ab 2018 (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 und Nano 300. Ein Auslesen liest 63 der 64 Blöcke des Flash-Speichers, ohne etwas zu entsperren; kein Lesen erreicht auf diesen Builds den Block bei {block}. Die Firmware ist verschlüsselt gespeichert. Slots werden einzeln im Tab „Firmware-Slots bearbeiten“ geschrieben.',
  'family.summary.early':
    'Die Compacts von 2014, die älter als 0.8.0.0 sind: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 und 0.7.0.8. Ihre Firmware kann den Lesebefehl eines Auslesens nicht beantworten, daher lehnen „Auslesen“, „Alle Selektoren auslesen“, das vollständige Lesen im Tab „Info“ und der Tab „Firmware-Slots bearbeiten“ sie nach dem Lesen der Version ab; auf 0.3.0.1 würde der Befehl, mit dem ein Auslesen beginnt, stattdessen ein Firmware-Upgrade vorbereiten. Der Preserve-Durchlauf liest 0.7.0.7 und 0.7.0.8 über einen anderen Befehl, den diese beiden Builds beantworten. Ein auf anderem Weg erstelltes Flash-Abbild lässt sich wie gewohnt entschlüsseln.',
  'family.summary.compact2016':
    'Die Builds 1.0.3.x der Compact PRO (1.0.3.0 und 1.0.3.2). Sie beantworten Lesebefehle genau wie die Compacts von 2014, Entsperr-Token eingeschlossen. Unterschieden werden sie daher an ihrer Version und daran, wie ihre Slots gespeichert sind: verschlüsselt, während die Slots von 2014 im Klartext vorliegen. Eine Kamera mit 1.0.3.x wird von Anfang an als diese Familie gelesen. Der Preserve-Durchlauf liest den gesamten Flash-Speicher, und Slots werden einzeln im Tab „Firmware-Slots bearbeiten“ geschrieben.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Die Compacts von 2014 mit 0.8.0.0 bis 1.3.0.8, darunter der 16-Hz-Build 1.3.0.8 FF. Eine Kamera im Originalzustand gibt weniger als die Hälfte ihres Flash-Speichers heraus, einen Teil davon nur gegen ein Entsperr-Token, das das Toolkit sendet; der Preserve-Durchlauf liest den Rest über einen vorübergehenden Patch. Slots sind im Klartext gespeichert, außer beim FF-Build. Eine Compact PRO mit 1.0.3.x wird als compact-2016 gelesen und wechselt nur hierher, wenn ein Slot im Klartext gespeichert ist oder sich zu {sum} entschlüsselt, wie die Slots des FF-Builds. Slots werden im Tab „Firmware-Slots bearbeiten“ auf den Builds geschrieben, an denen der Preserve-Durchlauf gemessen wurde; jeder andere Build mit 0.x oder 1.x wird nur gelesen.',
  'family.summary.generic':
    'Eine Kamera, zu der keine andere Familie passt. `seek-fw dump` liest sie mit der 4.x-Blockliste (der 4.x/Nano-Tab lehnt sie ab), und eine Entschlüsselung berechnet den Schlüssel aus dem Image selbst, daher hängt keines von beiden von der Vermutung ab. Es wird kein Slot geschrieben: Der Tab „Firmware-Slots bearbeiten“ lehnt sie ab, bis die Kamera erkannt ist.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'der Image-Header nennt',
  'detect.source.camera': 'die Kamera meldet',
  'detect.plainArmedNotInForce':
    'ein einfaches 2-Byte-BeginFirmwareUpgrade hat einen geschützten Slot geöffnet, daher ist der authentifizierte Lesekanal nicht in Kraft',
  'detect.modern.plainRefused':
    'ein einfaches 2-Byte-BeginFirmwareUpgrade für einen geschützten Slot wurde ABGELEHNT, was kein Build dieser Linie tut — sein Handler hat keine Token-Prüfung und nimmt den einfachen Kanal auf jedem Slot an',
  'detect.modern.authArmed':
    'ein geschützter Slot wurde über den authentifizierten 18-Byte-Selektor geöffnet; den einfachen hat dort niemand probiert, daher ordnet das diese Kamera nicht außerhalb dieser Linie ein',
  'detect.modern.legacyVersion':
    '{said} Firmware {version}, die auf der Legacy-Linie 0.x / 1.x liegt (eine andere Nummerierung, kein älteres 4.x — und einer dieser Builds trifft ebenfalls die Summe {sum})',
  'detect.modern.noSum':
    'kein Slot entschlüsselt sich zur Prüfsumme {sum}, die der Bootloader dieser Familie verlangt',
  'detect.modern.sum': 'ein Slot entschlüsselt sich zur Prüfsumme {sum}',
  'detect.modern.version':
    'Firmware {version} liegt auf der Linie ab 2018, die diese Selektortabelle abdeckt (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'ein einfaches 2-Byte-BeginFirmwareUpgrade hat einen geschützten Slot geöffnet, daher ist das nicht die gesperrte Legacy-Firmware',
  'detect.modern.none': 'keine Hinweise, die diese Kamera auf die Linie ab 2018 einordnen',
  'detect.early.noVersion':
    'es wurde keine Firmware-Version gemeldet oder in einem Image-Header gefunden',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'Firmware {version} ist {first} oder neuer, daher hat ihre RPC-Tabelle einen Getter für GetFeaturedFirmwareData, und der normale Leseweg gilt',
  'detect.early.older':
    '{said} Firmware {version}, die älter ist als {first} — der erste Build, dessen RPC-Methodentabelle einen Lese-Handler (Getter) für GetFeaturedFirmwareData hat',
  'detect.early.noWindow': 'und kein Fenster konnte gelesen werden, was genau dazu passt',
  'detect.generic.fallback':
    'Ersatzlösung: Keine Firmware-Familie passte sicher, daher bleibt Lesen möglich und Schreiben nicht',
  'detect.compact2016.early':
    'Firmware {version} ist älter als 0.8.0.0 und hat keinen Lese-Handler für GetFeaturedFirmwareData — das ist early-compact, nicht diese Familie',
  'detect.compact2016.modernSum':
    'ein Slot entschlüsselt sich zur Prüfsumme {sum}, die nicht das Ziel dieser Generation ist',
  'detect.compact2016.plainArmed':
    'ein einfaches 2-Byte-BeginFirmwareUpgrade hat einen geschützten Slot geöffnet, daher ist diese Kamera nicht auf der gesperrten Linie, die diese Familie mit legacy-auth teilt',
  'detect.compact2016.notLine': 'Firmware {version} liegt nicht auf der Linie 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'ein Slot ist im Klartext gespeichert — die Schlüsselstrom-Berechnung liefert den Identitätszustand, seine gespeicherten Wörter SIND also das Image —, das ist die Klartext-Kette von 2014; die Slots dieser Generation sind xorshift128 unter einem echten Schlüssel',
  'detect.compact2016.keyedZero':
    'ein unter einem echten xorshift128-Schlüsselstrom gespeicherter Slot entschlüsselt sich zur Prüfsumme {sum}, was die Verschlüsselung dieser Generation ist',
  'detect.compact2016.zeroSum':
    'ein Slot entschlüsselt sich zur Prüfsumme {sum}, die das Ziel dieser Generation ist',
  'detect.compact2016.refused':
    'und ein geschützter Slot hat das einfache 2-Byte-Öffnen abgelehnt, was der gesperrte Handler ist',
  'detect.compact2016.proLine':
    '{said} Firmware {version}, die 1.0.3.x-Linie der Compact PRO von 2016',
  'detect.compact2016.compactLine':
    '{said} Firmware {version}, ein Compact-Build, nicht die 1.0.3.x-Linie der Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} Firmware {version}, auf der Linie 0.x / 1.x, die diese Generation mit der gesperrten Legacy-Firmware teilt',
  'detect.compact2016.bootloader2016':
    'der Bootloader meldet {version}, einen Bootloader der Generation 2016 (1.2.0.0 ist unter Compact PRO 1.0.3.0 gemessen; der der Compact von 2014 ist 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'der Bootloader meldet {version}, die Nummerierung der Generation 2014, nicht die dieser Generation',
  'detect.compact2016.none':
    'bei keinem Slot wurde beobachtet, dass er sich unter einem echten Schlüssel zu einer Prüfsumme von null entschlüsselt',
  'detect.legacy.proLine':
    'aber Firmware {version} ist die 1.0.3.x-Linie der Compact PRO von 2016, deren Slots die Verschlüsselung von compact-2016 haben: Die Annahmeprüfung dieser Familie würde jeden von ihnen ablehnen',
  'detect.legacy.early':
    'Firmware {version} ist älter als 0.8.0.0: Ihre RPC-Tabelle hat keinen Lese-Handler für GetFeaturedFirmwareData (vor 0.7.0.7 gar keinen, und auf 0.7.0.7 und 0.7.0.8 nur einen Setter) — das ist early-compact, nicht diese Familie',
  'detect.legacy.keyedZero':
    'ein unter einem echten xorshift128-Schlüsselstrom gespeicherter Slot entschlüsselt sich zu {zero} — die Verschlüsselung der Compact PRO von 2016 (compact-2016). Diese Linie speichert ihre Slots im Klartext mit einer Wortsumme von 0 (die Kette von 2014) oder auf {sum} abgestimmt (Compact 1.3.0.8), und ihre Annahmeprüfung lehnt einen solchen Slot ab',
  'detect.legacy.plainChain':
    'ein Slot ist als Klartext-Firmware gespeichert, deren Wörter sich zu 0 summieren, so wie der Bootloader von 2014 dieser Linie ihn startet',
  'detect.legacy.refused':
    'die Kamera hat es abgelehnt, einen gesperrten Slot für ein Upgrade zu öffnen, als sie ohne die Entsperrung gefragt wurde, was nur diese Firmware-Generation tut',
  'detect.legacy.unlocked':
    'und sie hat denselben Slot geöffnet, als sie mit der Entsperrung gefragt wurde, die Entsperrung dieser Familie ist also die, die diese Kamera prüft',
  'detect.legacy.notLine':
    '{said} Firmware {version}, die nicht auf der Legacy-Linie 0.x / 1.x liegt',
  'detect.legacy.authOnly':
    'sie hat einen gesperrten Slot für ein Upgrade geöffnet, als sie mit der Entsperrung gefragt wurde, wie diese Firmware-Generation es tut; ohne Entsperrung wurde nicht gefragt, daher belegt das allein die Generation nicht',
  'detect.legacy.version':
    'Firmware {version} liegt auf der Legacy-Linie 0.x / 1.x, einer anderen Nummerierung als die Anwendungsversionen ab 2018, nicht auf einem älteren 4.x',
  'detect.legacy.none': 'nichts Beobachtetes deutet auf den authentifizierten Lesekanal hin',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'nach einem Lauf an einer Kamera zurückgehalten: Dort hat der Patch die Ausgaberate nicht erhöht, und der Verschluss hat nach dem Schreiben bei jedem Bild ausgelöst',
  'fps.table.predates':
    'Firmware {version} ist älter als 0.8.0.0: Ihre RPC-Tabelle hat keinen Lese-Handler für GetFeaturedFirmwareData, den Befehl, den ein Slot-Lesen sendet. Daher lesen und schreiben die Slot-Funktionen keinen Slot dieses Builds, und der Patch wird nicht angeboten',
  'fps.table.stageTwoFf':
    'stage two: Der 16-Hz-FF-Build wird so übertragen, wie die Hersteller-App ihn überträgt (das Image XOR Schlüssel A, gespeichert unter Schlüssel B), nicht als Klartext-Bytes, daher ist seine Übertragungsprüfung nicht erledigt, und der Patch wird noch nicht angeboten',
  'fps.table.stageTwo':
    'stage two: Dieser Eintrag gehört nicht zur stage-two-Gruppe, daher ist seine Übertragungsprüfung nicht erledigt, und der Patch wird noch nicht angeboten',
  'fps.table.notOffered': 'nicht angeboten',
  'fps.table.notImage': 'das ist kein Firmware-Image, daher gilt dafür kein Bildraten-Patch',
  'fps.table.otherBuild':
    'das Image ist der Build {image} („{id}“), aber die Kamera meldet {camera}; der Patch wird abgelehnt, statt auf einen Build angewendet zu werden, zu dem er nicht passt',
  'fps.table.otherBuildNoVersion':
    'das Image ist der Build {image} („{id}“), aber die Kamera meldet keine Version; der Patch wird abgelehnt, statt auf einen Build angewendet zu werden, zu dem er nicht passt',
  'fps.table.patched': 'der Bildraten-Patch ist bereits angewendet: Dieses Image läuft mit {hz} Hz',
  'fps.table.earlierPatch':
    'dieses Image enthält einen früheren {hz}-Hz-Bildraten-Patch ohne die USB-Korrektur, und ein Patch wird nie auf ein gepatchtes Image angewendet: Stellen Sie das Original-Image wieder her und patchen Sie es dann',
  'fps.table.atRate': 'dieser Build läuft bereits ohne Patch mit {hz} Hz',
  'fps.table.not4821':
    'dieses Image meldet den Build Compact 4.8.2.1 (oder Compact XR 4.8.2.1, derselbe Build), ist aber nicht das Original-Image, für das der Bildraten-Patch geschrieben wurde (f96ac57eda75: seine 68-Byte-Befehlsseiten, stabile Seite 13), daher wird dafür kein Bildraten-Patch erstellt',
  'fps.table.notInTable':
    'dieses Image ist nicht in der Tabelle der Bildraten-Patches, daher wird für diesen Build kein Bildraten-Patch erstellt. Die Tabelle nennt die Compact-Builds 0.7.0.8 bis 1.3.0.8 (8 Hz; 0.7.0.8 wird vom Slot-Code abgelehnt), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 und 4.16.1.7 FF sowie die Compact-PRO-Builds 1.0.3.x und 4.9.x; kein anderer Build hat einen Eintrag',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'der Plan dieses Builds hat keinen {bank}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} kann auf diesem Build kein entschlüsseltes Image annehmen: {reason}',
  'fps.plan.empty': '{bank} hat kein entschlüsseltes Image zum Patchen (er ist leer)',
  'fps.plan.noImage':
    '{bank} hat kein entschlüsseltes Image zum Patchen (er wurde nicht gelesen, oder kein Schlüssel öffnet ihn)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} wurde geschrieben, aber die zurückgelesenen Daten weichen nicht nur wie geplant vom gesicherten Slot ab, daher wurden die Slots danach nicht geschrieben',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    'Der gestartete Slot, der auf dieser Firmware-Linie genannt wird, ist der Slot, aus dem die Kamera bei ihrem letzten Start gestartet ist, wie ihn das Aktiv-Slot-Wort festhält (0 Slot A, 1 Slot B, 2 Recovery-Slot R). Der nächste Start wird durch das Boot-Konfigurationswort festgelegt: 0 oder 0xFFFFFFFF wählen zuerst A, 1 zuerst B, jeder andere Wert zuerst Recovery-Slot R. Recovery-Slot R läuft immer dann, wenn A und B nichts enthalten, was der Bootloader von 2014 annimmt (einen Slot, dessen Wörter sich zu 0 summieren), egal was R enthält (an einer Kamera gemessen).',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    'Der gestartete Slot, der auf dieser Firmware-Linie genannt wird, ist der Slot, aus dem die Kamera bei ihrem letzten Start gestartet ist, wie der Bootloader ihn im Aktiv-Slot-Wort festhält (0 Slot A, 1 Slot B, 2 Recovery-Slot R). Der nächste Start wird durch das Boot-Konfigurationswort festgelegt: 0 oder 0xFFFFFFFF wählen zuerst A, 1 zuerst B, jeder andere Wert zuerst Recovery-Slot R. Der Bootloader von 2016 nimmt einen Slot nur an, wenn er sich unter dem Schlüssel, unter dem er einen Slot prüft (Schlüsselblock 1 auf seinem Bootloader 1.2.0.0), zu einer Wortsumme von 0 entschlüsselt, und der letzte Slot dieser Reihenfolge läuft ungeprüft, wenn die anderen beiden scheitern. Das Lesen benennt diesen Schlüssel anhand des Slots, aus dem die Kamera gestartet ist, weil der Bootloader-Block, der ihn enthält, auf jedem Kanal abgelehnt wird (an einer Kamera gemessen).',
  'notes.ep0of1032':
    '1.0.3.2: EP0-Sitzungen brechen bei etwa 64 bis 81 KB ab, und 128 B ist die verlustfreie Leseeinheit, daher ist ein 64-KB-Slot pro Sitzung die gemessene Grenze. Ein volles Auslesen des ganzen Chips wird auf diesem Build abgelehnt (PRESERVATION.md: Es gibt kein volles Auslesen mit einer einzigen Öffnung). Das Auslesen der Slots liest einen Slot nach dem anderen, in Anfragen zu 64 Bytes.',
  'notes.token':
    'Auf dieser Firmware-Linie sind die Slots gesperrt: Die Kamera öffnet einen Slot nur dann zum Schreiben, wenn sie mit der Entsperrung dieser Linie gefragt wird, die in allen 22 erfassten Firmware-Images dieser Linie gleich ist. Eine Kamera mit einer anderen Entsperrung lehnt ihre Slots ab.',
  'notes.staging.lockedPlain':
    'Übertragen: das Image selbst, höchstens 56 KB (das Meiste, was die Kamera in einem Schreibvorgang annimmt). Der Schreibvorgang löscht den 64-KB-Slot und schreibt genau diese Bytes, und der Rest des Slots liest sich gelöscht. Der Bootloader startet einen Slot nur, wenn dessen Wörter sich zu 0 summieren, daher wird das Image vor dem Senden auf diese Summe ausgeglichen.',
  'notes.staging.locked2016':
    'Übertragen: das Image, XOR den xorshift128-Schlüsselstrom seines EIGENEN Schlüsselblocks 0 (der Übertragungsschlüssel, im Image anhand des Werts gefunden), nur in Image-Länge (höchstens 0xE000 Bytes). Das Gerät entschlüsselt die Nutzdaten mit diesem Schlüssel und speichert sie unter dem Schlüssel, unter dem sein Bootloader einen Slot prüft (Schlüsselblock 1), daher sind die gespeicherten Bytes nicht die übertragenen. Zum Übertragen wird nichts aus dem Ziel-Slot gelesen: Der Schlüsselstrom des Slots dient nur zum Zurücklesen des Slots.',
  'notes.staging.modern':
    'Übertragen: der ganze 64-KB-Slot, Image + 0xFF-Auffüllung + „CODE“-Footer. Das Image wird mit den Schlüsselströmen XOR-verknüpft, die dafür sorgen, dass die zwei eigenen Durchgänge der laufenden Anwendung es unter dem Schlüssel ablegen, den der gestartete Slot enthält: Wenn der Commit-Befehl (CompleteMemoryUpgrade) Datentyp 7, 8 oder 9 erhält, entschlüsselt die Anwendung den Upload mit ihrem Schlüssel A, verschlüsselt ihn unter ihrem Speicherschlüssel neu und programmiert den Slot. Der Footer sorgt dafür, dass der Bootloader den Slot annimmt; ein Slot ohne ihn wird abgelehnt.',
  'notes.modernGap':
    'Slot B liegt auf dieser Firmware-Linie bei 0x14050000 (Modus 8). Kein Selektor erreicht 0x14060000 auf irgendeinem Build 2.x, 4.x, 10.x, 42.x oder 44.x (dekodiert aus den 14 Images der Sammlung ab 2018), daher liegt dort kein Slot. Das Layout mit 0x14060000 gehört zur gesperrten Linie 0.x/1.x.',
  'notes.modernNamedWrite':
    'Benannte Schreibvorgänge (Modi 7 bis 9) sind aus der Firmware dekodiert. Der Emulator schreibt A, B und R über sie auf den 4.x-Builds, und an einer Kamera wurde Slot A einer Compact XR 4.8.2.1 über Modus 7 vom Bildraten-Patch beschrieben. Ein Slot-Schreiben öffnet nie Modus 0, das Upgrade-Ziel.',
  'notes.unverified':
    'Nur Lesen. Das Slot-Layout ist die dekodierte Tabelle der gesperrten Linie, aber für diesen Build wurde keine Übertragungsform gemessen, daher wird kein Schreibvorgang geplant.',
  'notes.empty.plain':
    'Ein leerer Slot nimmt ein Image genauso an wie ein belegter. Die Klartext-Kette überträgt die Image-Bytes, wie sie sind, ohne Schlüssel, und der Commit löscht den Block zuerst, daher wird nichts aus dem Ziel-Slot gelesen. An einer Compact gemessen: Ein in einen leeren Slot B geschriebenes Image las sich identisch zurück, und B startete allein.',
  'notes.empty.modern':
    'Ein leerer Slot nimmt ein Image genauso an wie ein belegter. Die Nutzdaten werden unter Schlüsseln verschlüsselt, die vom gestarteten Slot und der laufenden Anwendung abgeleitet sind, nicht vom Ziel-Slot, und das Gerät verschlüsselt sie neu und löscht den Block, ohne ihn zu lesen. Der Footer wird aus einem Slot kopiert, der einen gültigen enthält, sonst leer aufgebaut. Auf dem Emulator nachgewiesen; an einer Kamera noch nicht gemessen.',
  'notes.empty.locked2016':
    'Ein leerer Slot nimmt ein Image genauso an wie ein belegter. Der Übertragungsschlüssel ist Schlüsselblock 0 aus dem eigenen Paar des IMAGES, kein aus dem Ziel-Slot gelesener Schlüssel, und das Gerät entschlüsselt die Nutzdaten damit, speichert sie unter seinem eigenen Schlüssel und löscht den Block, ohne ihn zu lesen. Auf dem Emulator nachgewiesen; an einer Kamera noch nicht gemessen.',
  'notes.mode2of080':
    '0.8.0.0: Modus 2 (0x14000000) ist auf diesem Build eine Absturzgefahr, ein geöffnetes Lesen läuft über das SRAM hinaus (PRESERVATION.md). Ein Slot-Lesen oder -Schreiben öffnet nur die Modi 7 bis 9 und nie Modus 2.',
  'notes.keyPairs2016':
    'Die 9-Hz-Builds von 1.0.3.0 und 1.0.3.2 teilen sich ein Schlüsselpaar, die FF-Builds ein anderes. Die Versionszeichenkette unterscheidet sie nicht, daher wird der Schlüsselstrom aus dem Slot selbst gewonnen, und das eigene Image des Slots entscheidet.',
  'notes.board1030':
    'Die Anwendung 1.0.3.0 startet auf jeder Platine außer der der Compact Pro neu, daher läuft sie auf einer Compact-Platine nur mit dem Platinen-Patch in ihren Slots.',
  'notes.bank.modernA':
    'Geschrieben über eine Slot-Öffnung, die die moderne Tabelle auslässt; eine Compact XR 4.8.2.1 hat darüber einen Schreibvorgang angenommen (an einer Kamera).',
  'notes.bank.recovery2016':
    'An einer Compact PRO 1.0.3.0 gemessen: Recovery-Slot R hat sein eigenes Image, eine Änderung um ein Byte und die Rohdaten so, wie sie gesendet wurden, angenommen, jeweils ohne Fehler geschrieben.',
  'notes.bank.ff1308A':
    'Das 1.3.0.8-FF-Image (16 Hz) kommt hierher in der Form, in der die Hersteller-App es sendet, und die Kamera speichert es unter ihrem eigenen Schlüssel. Der Bootloader von 2014 startet einen Slot nur, wenn dessen Wörter sich zu 0 summieren, daher übergeht er diesen beim Start; ob der 16-Hz-Build aus Slot A startet, ist UNTESTED (ungetestet). Das 8-Hz-Image wird so geschrieben, wie es ist.',
  'notes.bank.ff1308B':
    'Das 1.3.0.8-FF-Image (16 Hz) kommt hierher in der Form, in der die Hersteller-App es sendet, und die Kamera speichert es unter ihrem eigenen Schlüssel. Der Bootloader von 2014 startet einen Slot nur, wenn dessen Wörter sich zu 0 summieren, daher übergeht er diesen beim Start; ob der 16-Hz-Build aus Slot B startet, ist UNTESTED (ungetestet). Das 8-Hz-Image wird so geschrieben, wie es ist.',
  'notes.bank.ff1308R':
    'Das 1.3.0.8-FF-Image (16 Hz) kommt hierher in der Form, in der die Hersteller-App es sendet, und die Kamera speichert es unter ihrem eigenen Schlüssel. Der Bootloader 0.9.0.0 startet Recovery-Slot R so, wie er gespeichert ist, ohne ihn zu dekodieren, daher startet diese Form womöglich nicht: UNTESTED (ungetestet), und eine frühere Form dieses Images ist von hier gestartet (an einer Kamera gemessen). Das 8-Hz-Image wird so geschrieben, wie es ist.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 und Compact XR 4.8.2.1 (ein Image): die moderne Tabelle mit 63 Fenstern; der Emulator hat 63 von 63 Fenstern am vollständigen Flash-Abbild der Compact und an dem der Compact XR bestätigt.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31: die moderne Tabelle mit 63 Fenstern, gemessen: Auf dem Emulator wird jedes Fenster bestätigt.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33: die moderne Tabelle mit 63 Fenstern, gemessen: Auf dem Emulator wird jedes Fenster bestätigt.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10: die moderne Tabelle mit 63 Fenstern, gemessen: Auf dem Emulator wird jedes Fenster bestätigt. Sein Commit-Befehl (CompleteMemoryUpgrade) hat keinen Handler für Datentyp 32, nach dem ein Schreiben über Modus 7, 8 oder 9 nie fragt.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10: die moderne Tabelle mit 63 Fenstern, gemessen: Auf dem Emulator wird jedes Fenster bestätigt. Sein Öffnungsbefehl (BeginFirmwareUpgrade) lehnt einen Datentyp jenseits des angenommenen Bereichs (0x7F) als ungültiges erstes Argument ab, und die Modi 7 bis 9 liegen innerhalb dieses Bereichs.',
  'notes.ff1308':
    '1.3.0.8-FF (16 Hz) meldet dieselbe Version wie der 8-Hz-Build. Das Lesen unterscheidet sie an der Kamera: Die Kamera sagt Slot für Slot, ob ihre Anwendung den Slot annimmt, und für jeden Build lassen sich seine Antworten aus den Slots vorhersagen. Das FF-Image wird in der Form gesendet, in der die Hersteller-App es sendet, und die Kamera speichert es unter ihrem eigenen Schlüssel. Es kann in Slot A, Slot B oder Recovery-Slot R. Vom 8-Hz-Build wird erwartet, dass er es ablehnt, bevor er irgendetwas schreibt; solange die Antworten der Kamera die Builds nicht unterscheiden können, sagt der Plan, was jeder Build damit tut. {untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'die Kamera hat ihre Firmware-Version nicht gemeldet ({note}); eine Befehlsnummer bedeutet nicht in jeder Seek-Firmware dasselbe — auf Compact 0.3.0.1 ist Wire-ID 0x52, die ID, die ein Lesefenster öffnet, EnterBootloaderMode —, daher wird, bis die Version bekannt ist, nichts gesendet außer GetErrorCode, GetOperationMode und GetFirmwareInfo, den Lesebefehlen, die jeder Build gleich beantwortet',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo hat bei keinem von {reads} Lesevorgängen im Abstand von {spacing} ms geantwortet ({error}), einem Startfenster von {window} ms; eine Kamera, die noch startet, antwortet innerhalb dieser Zeit',
  'identity.note.neverTwice':
    'GetFirmwareInfo wurde in {reads} Lesevorgängen nie zweimal hintereinander beantwortet',
  'identity.note.noAnswer': 'GetFirmwareInfo hat nicht geantwortet ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo hat nicht geantwortet ({error}); {answered} von {reads} Lesevorgängen wurden beantwortet, nie zwei hintereinander, daher lässt sich keine dieser Antworten von einem Datensatz unterscheiden, den ein früherer Befehl ausgewählt hinterlassen hat',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo hat mit {count} Byte geantwortet, zu wenig für eine Version',
    other: 'GetFirmwareInfo hat mit {count} Byte geantwortet, zu wenig für eine Version',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo hat mit {count} Byte geantwortet, zu wenig für eine Version; {context}',
    other: 'GetFirmwareInfo hat mit {count} Byte geantwortet, zu wenig für eine Version; {context}',
  },
  'identity.note.otherRecord':
    'der erste Lesevorgang hat einen anderen Datensatz geliefert ({version}), auf den ein früherer Befehl den Firmware-Info-Selektor gestellt hatte — dieser Lesevorgang hat ihn zurückgesetzt',
  'identity.note.afterStartup': {
    one: 'sie hat geantwortet, nachdem sie während des Starts {count}-mal das Lesen abgelehnt hatte',
    other:
      'sie hat geantwortet, nachdem sie während des Starts {count}-mal das Lesen abgelehnt hatte',
  },
  'identity.predates':
    'Firmware {version} ist älter als das Auslese-Protokoll: Ihre RPC-Methodentabelle hat keinen Lese-Handler für GetFeaturedFirmwareData (auf 0.7.0.7 und 0.7.0.8 ist er nur als Setter registriert, und davor ist Wire-ID 0x4F UploadFirmwareRowSize), daher kann damit kein Fenster gelesen werden; auf 0.3.0.1 ist Wire-ID 0x52 EnterBootloaderMode statt BeginFirmwareUpgrade. Der Preserve-Durchlauf liest 0.7.0.7 und 0.7.0.8 stattdessen über Wire-ID 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': '{operation} abgelehnt: {reason}',
  'identity.refusingNoVersion':
    '{operation} abgelehnt: {reason}. Es wurde kein Fenster geöffnet. Ziehen Sie die Kamera ab, stecken Sie sie wieder ein, lassen Sie sie fertig starten und versuchen Sie es erneut.',
  'identity.operation.dump': 'Auslesen',
  'identity.operation.dumpAll': 'Auslesen aller Selektoren',
  'identity.operation.readInfo': 'Lesen der Geräteinformationen',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'die Slots werden nach der Sicherung gewählt, die sie liest — führen Sie zuerst die Sicherung aus',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'die Slots können sich nicht mehr ändern, sobald der Commit gelaufen ist oder versucht wurde: Dieser Durchlauf schreibt {banks}, und die Wiederherstellung stellt genau diese wieder her',
  'preserve.banks.none': 'keinen Slot',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Geschrieben.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Gelesen. {count}/{of} Slots lesbar.',
  'status.readRefused':
    'Gelesen, aber kein Slot dieser Kamera kann von hier aus beschrieben werden — siehe Protokoll.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Firmware-Version',
  'compare.field.imageId': 'Image-ID',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Anfangs-SP',
  'compare.field.resetVector': 'Reset-Vektor',
  'compare.field.size': 'Größe',
  'compare.field.shaExpected': 'SHA-256 des erwarteten Klartext-Images',
  'compare.field.sha': 'SHA-256 des Images',
  'compare.field.shaNotStored':
    'SHA-256 des erwarteten Klartext-Images (gespeicherte Bytes nicht vorhergesagt)',
  'compare.field.key': 'Schlüssel',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(kein Image)',
  'compare.notImage': '(kein gültiges Image)',
  'compare.notPredicted': '(nicht vorhergesagt: Das Gerät entscheidet, was es speichert)',
  'compare.plaintext': 'keiner (Klartext)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'ließ sich nicht zweimal gleich lesen',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (der Schlüssel, unter dem der Bootloader einen Slot prüft, ist aus {bank} erschlossen, den er ohne seine Prüfung angesprungen hat) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, wie die Kamera es festhält (Aktiv-Slot-Wort {word})',
  'preserve.lastStart.notRead': 'unbekannt — das Aktiv-Slot-Wort konnte nicht gelesen werden',
  'preserve.lastStart.noBank':
    'unbekannt — das Aktiv-Slot-Wort ist {word}, was keinen Slot bezeichnet',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'unbekannt — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'wird nicht beschrieben — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'ein Image',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — beschreibbar',
  'preserve.bank.writablePatch': '{build} — beschreibbar; der Patch ändert {count} Bytes',
  'preserve.bank.writableEdit': '{build} — beschreibbar; enthält {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — beschreibbar; der Patch ändert {count} Bytes; enthält {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'die Sicherung hat die Slots noch nicht gelesen, daher kann kein Slot gewählt werden',
  'preserve.choice.every': 'jeder Slot, der ein Image enthält: {banks}',
  'preserve.choice.everyBlocked':
    'die Auswahl „jeder Slot mit Image“ ist nicht möglich: {bank} kann nicht beschrieben werden — {reason}',
  'preserve.choice.noImage': 'kein Slot enthält ein Image, das der Durchlauf beschreiben kann',
  'preserve.choice.nextStart': '{bank}, der Slot des nächsten Starts: {why}',
  'preserve.choice.nextStartRefused':
    'der nächste Start erfolgt aus {bank} ({why}), und der Durchlauf kann ihn nicht beschreiben: {reason}',
  'preserve.choice.everyUnknownStart':
    'jeder Slot, der ein Image enthält ({banks}): Aus welchem Slot der nächste Start erfolgt, ist unbekannt ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'aus welchem Slot der nächste Start erfolgt, ist unbekannt ({why}), und {reason}; wählen Sie einen Slot mit Namen',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} kann nicht beschrieben werden: {reason}',
  'preserve.choice.byName': '{banks}, der mit Namen gewählte Slot',
  'preserve.choice.warnNotPatched':
    'Der nächste Start erfolgt aus {bank} ({why}), und diese Auswahl patcht ihn nicht: Nach dem Neustart führt die Kamera das eigene Image dieses Slots aus, daher hält das volle Auslesen an, bevor es irgendetwas liest. Die Wiederherstellung stellt trotzdem jeden beschriebenen Slot wieder her.',
  'preserve.choice.warnUnknownStart':
    'Aus welchem Slot der nächste Start erfolgt, ist unbekannt ({why}). Erfolgt er aus einem Slot, den diese Auswahl nicht patcht, hält das volle Auslesen an, bevor es irgendetwas liest.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'noch unbekannt',
  'preserve.build.firmware': 'Firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'so, wie die Kamera sie speichert (diese Kamera hält ihre Firmware unverschlüsselt)',
  'preserve.stagedForm.oneKey':
    'in der Form, in der die Kamera sie speichert (verschlüsselt unter dem Schlüssel der Kamera)',
  'preserve.stagedForm.twoKeys':
    'in der Form, in der die Kamera sie speichert (verschlüsselt unter den zwei Schlüsseln der Kamera)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'jeder beschriebene Slot erhält genau die Bytes zurück, die die Sicherung aus ihm gelesen hat',
  'preserve.restoreForm.factoryStaged':
    'jeder beschriebene Slot erhält seine Original-Firmware zurück, geschrieben in der Form, in der die Kamera sie speichert, sodass der Slot Byte für Byte so endet, wie die Sicherung ihn gelesen hat',
  'preserve.restoreForm.none':
    'auf diesem Build nicht möglich: Keine Form der Original-Firmware besteht die eigene Prüfung der Kamera und wird zugleich wieder als die Original-Bytes gespeichert, daher endet der Durchlauf mit dem vollständigen Abbild und dem Patch noch an seinem Platz',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'auf diesem Build nicht möglich: Die gepatchte Firmware kann nicht den gesamten Flash-Speicher lesen, daher hat der Durchlauf kein vollständiges Abbild zu liefern',
  'preserve.drain.rotated':
    'die Kamera liefert ihn rotiert, und der Durchlauf bringt ihn wieder in die richtige Reihenfolge',
  'preserve.drain.hazard':
    'der Patch vermeidet auf diesem Build ein Lesen, das die Kamera abstürzen lässt',
  'preserve.drain.whole':
    'der gesamte 4-MB-Flash-Speicher in einem Durchgang, {size} Bytes auf einmal',
  'preserve.drain.wholeNotes':
    'der gesamte 4-MB-Flash-Speicher in einem Durchgang, {size} Bytes auf einmal; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'lässt den Lesebefehl der Kamera den gesamten 4-MB-Flash-Speicher erreichen, nicht nur die ersten 64 KB',
  'preserve.site.countPast':
    'lässt die Leseposition über 64 KB hinaus zählen, damit ein Lesen nicht zum Anfang zurückspringt',
  'preserve.site.keepPosition':
    'behält die vollständige Leseposition, wenn sie nach jedem Lesen weiterrückt',
  'preserve.site.savePosition': 'speichert die weitergerückte Leseposition vollständig',
  'preserve.site.clearPosition':
    'setzt die vollständige Leseposition bei jedem Lesebeginn zurück, damit die Kamera nach dem vollen Auslesen weiterhin gelesen werden kann',
  'preserve.site.modeTwoGuard':
    'lässt das volle Auslesen wie jedes andere Lesen beginnen (die Original-Firmware weist es ab)',
  'preserve.site.modeTwoIndirection':
    'lässt das volle Auslesen am Anfang des Flash-Speichers beginnen (die Original-Firmware lässt es auf einen Wert zeigen, der die Kamera abstürzen lässt)',
  'preserve.site.armTail':
    'entfernt einen Aufruf, der die Kamera auf diesem Build einfrieren lässt, wenn ein Lesen beginnt',
  'preserve.site.other': 'ändert eine Anweisung, die das volle Auslesen braucht',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Sicherung',
  'preserve.step.patch': 'Patch',
  'preserve.step.commit': 'Schreiben',
  'preserve.step.drain': 'Volles Auslesen',
  'preserve.step.restore': 'Wiederherstellung',
  'preserve.step.verify': 'Prüfung',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: wie geplant angehalten — die Kamera ist aus {bank} gestartet, den dieser Durchlauf nicht gepatcht hat, daher wurde nichts gelesen.',
  'preserve.result.noReason': 'es wurde kein Grund festgehalten',
  'preserve.result.stopped': '{label}: angehalten — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'kein Slot enthält Firmware, die der Durchlauf patchen kann',
  'preserve.result.writable.one': '{banks} enthält Firmware, die der Durchlauf patchen kann',
  'preserve.result.writable.many': '{banks} enthalten Firmware, die der Durchlauf patchen kann',
  'preserve.result.backup':
    '{label}: Jeder Block, den ein normales Lesen erreicht, wurde gesichert; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'ein unbekannter Slot',
  'preserve.result.backupNext':
    '{label}: Jeder Block, den ein normales Lesen erreicht, wurde gesichert; {writable}; Slot des nächsten Starts: {next}.',
  'preserve.result.patch': '{label}: gebaut für {banks}.',
  'preserve.result.patchCount': '{label}: gebaut für {banks}; in jedem ändern sich {count} Bytes.',
  'preserve.result.commitOne':
    '{label}: {banks} mit dem Patch beschrieben, und die Kamera hat ihn angenommen.',
  'preserve.result.commitMany':
    '{label}: {banks} mit dem Patch beschrieben, und die Kamera hat jeden angenommen.',
  'preserve.result.drainNotRead': '{label}: nicht gelesen.',
  'preserve.result.drain':
    '{label}: Der gesamte 4-MB-Flash-Speicher wurde gelesen; das vollständige Abbild hat sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: Der gesamte 4-MB-Flash-Speicher wurde über {bank} gelesen; das vollständige Abbild hat sha256 {sha256}.',
  'preserve.result.restore': '{label}: {banks} zurückgeschrieben.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} zurückgeschrieben, {form}.',
  'preserve.result.verifyDone': '{label}: fertig.',
  'preserve.result.verifyIdentical':
    '{label}: {blocks} Blöcke erneut gelesen, 0 Bytes abweichend — der Flash-Speicher der Kamera ist byteidentisch mit der Sicherung.',
  'preserve.result.verifyDiffers':
    '{label}: {blocks} Blöcke erneut gelesen, {bytes} Bytes abweichend.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: {blocks} Blöcke erneut gelesen, {bytes} Bytes abweichend, {count} Block nicht lesbar.',
    other:
      '{label}: {blocks} Blöcke erneut gelesen, {bytes} Bytes abweichend, {count} Blöcke nicht lesbar.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Vor dem vollen Auslesen angehalten: Die Kamera ist aus einem Slot gestartet, den dieser Durchlauf nicht gepatcht hat, daher wurde nichts gelesen.',
  'preserve.unpatchedStart.next':
    'Als Nächstes: Die Wiederherstellung stellt jeden beschriebenen Slot wieder her. Das volle Auslesen wird nicht erneut versucht: Die Kamera würde aus demselben Slot starten.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Fertig — Ihre Firmware ist gesichert',
  'preserve.done.detail':
    'Das vollständige Abbild ist der gesamte ursprüngliche Flash-Speicher der Kamera, und die Kamera selbst ist wieder genau so, wie sie war.',
  'preserve.done.titleNoImage':
    'Fertig — die Kamera ist wieder wie zuvor; es gibt kein vollständiges Abbild',
  'preserve.done.detailNoImage':
    'Das volle Auslesen ist nicht gelaufen, daher hat dieser Durchlauf kein vollständiges Abbild des Flash-Speichers. Jeder beschriebene Slot wurde wiederhergestellt, und ein frisches Lesen der Blöcke, die ein normales Auslesen erreicht, stimmt mit der Sicherung überein. Für das vollständige Abbild starten Sie einen neuen Durchlauf mit einer Auswahl, die den Slot des nächsten Starts einschließt.',
  'preserve.done.detailNoImageCount':
    'Das volle Auslesen ist nicht gelaufen, daher hat dieser Durchlauf kein vollständiges Abbild des Flash-Speichers. Jeder beschriebene Slot wurde wiederhergestellt, und ein frisches Lesen der {blocks} Blöcke, die ein normales Auslesen erreicht, stimmt mit der Sicherung überein. Für das vollständige Abbild starten Sie einen neuen Durchlauf mit einer Auswahl, die den Slot des nächsten Starts einschließt.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'der Fenster-Leser der Kamera hat pro Start ein begrenztes Budget, und diese Lesevorgänge kamen von einem erschöpften Leser — schalten Sie die Kamera aus und wieder ein (abziehen und wieder einstecken oder ihren Netzschalter verwenden) und führen Sie dann `preserve --resume <run-directory>` erneut aus. Signatur: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'der Fenster-Leser der Kamera hat pro Start ein begrenztes Budget, und diese Lesevorgänge kamen von einem erschöpften Leser — schalten Sie die Kamera aus und wieder ein (abziehen und wieder einstecken oder ihren Netzschalter verwenden) und führen Sie dann `preserve --resume <run-directory>` erneut aus. Signatur: {signature} — aus diesen Bytes lässt sich kein Werks-Klartext ableiten. Jeder Weg, ihn zu lesen, wurde versucht:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'die Sicherung enthält {bank} ({address}) nicht — die Standardfenster können ihn nicht liefern',
  'preserve.fail.readsDisagree':
    'die zwei Lesevorgänge von {bank} stimmen nicht überein (sha256 {sha256} gegenüber {other}) — in eine Kamera, die den Slot, aus dem sie läuft, nicht zweimal hintereinander gleich liefern kann, sollte nicht geschrieben werden; die Aufnahme ist die Quelle der Wiederherstellung und die Grundlage für die Ableitung des Patches',
  'preserve.fail.notFactory':
    '{bank} enthält nicht das Werks-Image so, wie die Verschlüsselung dieses Builds es speichert (der erwartete Image-Anfang passt nicht zur Aufnahme) — abgelehnt, bevor irgendetwas festgehalten, geschweige denn geschrieben wird',
  'preserve.fail.ffSum':
    'die gepatchte Firmware besteht in der Form, in der die Kamera sie speichert, die eigene Prüfung dieses Builds nicht (ihre Summe muss {sum} sein) — abgelehnt, statt einen Slot zu senden, den die Kamera nach dem Löschen zurückweisen würde',
  'preserve.fail.headChanged':
    'der Anfang von {bank} hat sich seit der Sicherung geändert (er enthält weder die ursprüngliche Aufnahme noch die gepatchten Bytes) — Schreiben über einen unbekannten Slot-Zustand abgelehnt; es wurde nichts geschrieben. Anfang als Hex: aktuell {live}, Aufnahme {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} enthält bereits die gepatchten Bytes — der Commit ist bei einem früheren Versuch angekommen und darf nicht wiederholt werden. Setzen Sie beim Schritt des vollen Auslesens fort (--resume), der das gepatchte Image startet und von dort weitermacht.',
  'preserve.fail.landed':
    '{banks} enthalten bereits die gepatchten Bytes — der Commit ist bei einem früheren Versuch angekommen und darf nicht wiederholt werden. Setzen Sie beim Schritt des vollen Auslesens fort (--resume), der das gepatchte Image startet und von dort weitermacht.',
  'preserve.fail.drainRebootRefused':
    'der Neustart-Befehl des vollen Auslesens wurde vom Host ABGELEHNT, bevor er hinausging (ein SecurityError: eine Browser-Richtlinie oder ein Test-Schutz), daher führt die Kamera noch das Image aus, mit dem sie gestartet ist, nicht den per Commit geschriebenen Patch. Das volle Auslesen liest nur über das erweiterte Fenster des gepatchten Images, daher hält es an, bevor es irgendetwas öffnet; es wurde nichts gelesen. Führen Sie das volle Auslesen erneut dort aus, wo der Host den Neustart-Befehl durchlässt.',
  'preserve.fail.shiftedRebootRefused':
    'das volle Auslesen kam um eine Seite verschoben zurück, und der Neustart, der einen weiteren Start auslöst, wurde vom Host ABGELEHNT, bevor er hinausging (ein SecurityError: eine Browser-Richtlinie oder ein Test-Schutz) — ein weiterer Versuch würde denselben verschobenen Start auslesen. Es wurde nichts behalten; führen Sie das volle Auslesen erneut dort aus, wo der Reset hinausgehen kann.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'die Prüfung hat {count} abweichendes Byte über {read}/{total} Fenster gelesen — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
    other:
      'die Prüfung hat {count} abweichende Byte über {read}/{total} Fenster gelesen — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
  },
  'preserve.fail.verifyIn': {
    one: 'die Prüfung hat {count} abweichendes Byte über {read}/{total} Fenster gelesen (Stellen: {places}) — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
    other:
      'die Prüfung hat {count} abweichende Byte über {read}/{total} Fenster gelesen (Stellen: {places}) — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
  },
  'preserve.fail.verifyShort': {
    one: 'die Prüfung hat {count} abweichendes Byte über {read}/{total} Fenster gelesen (kurze Fenster: {short}) — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
    other:
      'die Prüfung hat {count} abweichende Byte über {read}/{total} Fenster gelesen (kurze Fenster: {short}) — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
  },
  'preserve.fail.verifyInShort': {
    one: 'die Prüfung hat {count} abweichendes Byte über {read}/{total} Fenster gelesen (Stellen: {places}) (kurze Fenster: {short}) — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
    other:
      'die Prüfung hat {count} abweichende Byte über {read}/{total} Fenster gelesen (Stellen: {places}) (kurze Fenster: {short}) — der Chip liest sich nicht byteidentisch mit der Sicherung zurück',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'der Boot-Konfigurationsblock',
  'preserve.fail.dataBlock': 'ein Datenblock',

  'preserve.refused.secondRead': 'sein zweites Lesen ist fehlgeschlagen ({error})',
  'preserve.refused.readsDisagree':
    'seine zwei Lesevorgänge stimmen nicht überein (sha256 {sha256} gegenüber {other})',
  'preserve.refused.erased': 'er ist gelöscht',
  'preserve.refused.watchdogMark':
    'sein Header-Wort bei +0x200 enthält {word}, die Markierung, die der Bootloader nach einem Watchdog-Reset früh in einem Start über einen Slot schreibt; der Bootloader nimmt diesen Slot nicht mehr an, und der Durchlauf hat dort kein Image zum Patchen',
  'preserve.refused.noHeader': 'er enthält keinen Image-Header bei +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'er enthält {image} ({id}), nicht den Build, den die Kamera ausführt ({camera})',
  'preserve.refused.otherKey':
    'die Prüfung des Bootloaders lehnt ihn ab: Er ist unter einem anderen Schlüssel gespeichert als dem, unter dem der Bootloader dieser Kamera Slots prüft, und ein Schreiben über die Kamera würde ihn unter jenem Schlüssel speichern, daher könnte die Wiederherstellung seine genauen Bytes nicht zurückbringen',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'die Kamera meldet Firmware {camera}, erwartet wird {version} — der Patch ist aus den Bytes eines Builds abgeleitet und darf nicht an einen anderen gesendet werden',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'Firmware {version} ist kein Build mit 0.x oder 1.x, und dieser Durchlauf deckt nur die Builds von 2014 und 2016 ab. Außer der Version wurde nichts gelesen. Lesen Sie diese Kamera stattdessen mit „Auslesen & entschlüsseln 4.x/Nano“: Dieser Tab liest den Flash-Speicher ohne Patch, jeden Block außer dem bei 0x14060000, den auf diesen Builds kein Lesefenster erreicht.',
  'preserve.refused.preWidening':
    'Firmware {version} ist älter als der Erweiterungsweg, und der Durchlauf lehnt ab, statt über einen Slot zu schreiben, den er nicht zurücklesen kann. Auf dieser Generation weist die Kamera jeden Weg ab, das Lesen zu starten, das der Weg braucht (an 0.3.0.1 gemessen), ihr Lesebefehl erreicht den Anfang des Flash-Speichers nicht, und die Größe, die der Patch ändern würde, ist anders gespeichert. Sie hat auch kein Lesen, das ein normales Auslesen nutzen kann. Außer der Version wurde nichts gelesen.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'enthält ein unbekanntes Image (weder die Original-Firmware {version} noch eine Änderung daran, die Preserve kennt), daher patcht Preserve es nicht und stellt es nicht wieder her',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'enthält einen bekannten Bildraten-Build: die Original-Firmware {version} mit dem {hz}-Hz-Bildraten-Patch. Preserve patcht nur die Original-Firmware, nie ein gepatchtes Image, daher patcht es diesen Slot nicht und stellt ihn nicht wieder her',
  'preserve.image.frameRateEarlier':
    'enthält einen bekannten Bildraten-Build: die Original-Firmware {version} mit einem früheren {hz}-Hz-Bildraten-Patch (erstellt, bevor die USB-Korrektur dazukam). Preserve patcht nur die Original-Firmware, nie ein gepatchtes Image, daher patcht es diesen Slot nicht und stellt ihn nicht wieder her',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'er {what}. Um diesen Slot einzubeziehen, schreiben Sie zuerst das Original-Image in ihn zurück (zum Beispiel aus einer vollständigen Flash-Sicherung von vor der Änderung) und starten Sie dann einen neuen Durchlauf',
  'preserve.image.frameRateWords':
    'er {what}. Um diesen Slot einzubeziehen, schreiben Sie zuerst das Original-Image in ihn zurück (zum Beispiel aus einer vollständigen Flash-Sicherung von vor dem Bildraten-Patch) und starten Sie dann einen neuen Durchlauf; der Bildraten-Patch lässt sich danach erneut auf das Original-Image anwenden',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Der Durchlauf nimmt die Firmware, die er patcht, aus diesem Slot, daher hält er hier an, bevor irgendetwas geschrieben wird. Um diese Kamera zu sichern, schreiben Sie zuerst das Original-Image zurück in {bank} (zum Beispiel aus einer vollständigen Flash-Sicherung von vor der Änderung) und starten Sie dann einen neuen Durchlauf.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Der Durchlauf nimmt die Firmware, die er patcht, aus diesem Slot, daher hält er hier an, bevor irgendetwas geschrieben wird. Um diese Kamera zu sichern, schreiben Sie zuerst das Original-Image zurück in {bank} (zum Beispiel aus einer vollständigen Flash-Sicherung von vor dem Bildraten-Patch) und starten Sie dann einen neuen Durchlauf; der Bildraten-Patch lässt sich danach erneut auf das Original-Image anwenden.',
  'preserve.image.otherFirmware':
    'er enthält Firmware {image}, nicht die {camera}, die die Kamera ausführt',
  'preserve.image.otherFirmwareRefusal':
    '{name} enthält Firmware {image}, nicht die {camera}, die die Kamera ausführt, daher hat dieser Durchlauf dort kein Image, das er patchen kann, und lehnt ab, statt darüber zu schreiben.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'daraus lässt sich kein Image ableiten, das der Durchlauf patchen kann ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** `{step}`, `{next}`, `{steps}`: the run's step ids (backup, patch, commit, drain, restore, verify), as the CLI names them: keep them. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone':
    'dieser Durchlauf ist abgeschlossen — jeder Schritt ist fertig (Durchlauf {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} ist in diesem Durchlauf bereits erledigt (fertig {finished}) — Fortsetzen macht bei {next} weiter',
  'preserve.gate.stepDoneUnknownTime':
    '{step} ist in diesem Durchlauf bereits erledigt (Zeitpunkt unbekannt) — Fortsetzen macht bei {next} weiter',
  'preserve.gate.backupRerun':
    'die Sicherung kann nicht erneut laufen: Dieser Durchlauf hat {steps} bereits abgeschlossen, und sein nächster Schritt ist {next} — verwenden Sie --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'der vorige Sicherungsversuch ist fehlgeschlagen, und die Kamera muss AUS- UND WIEDER EINGESCHALTET werden, bevor dieser Schritt erneut läuft — ein erneuter Versuch im selben Start kann veraltete oder leere Bytes lesen (gemessen: Eine wiederholte Sicherung las das Startwort des Bootloaders anstelle des Boot-Konfigurationsdatensatzes). Schalten Sie die Kamera aus und wieder ein (abziehen und wieder einstecken oder ihren Netzschalter verwenden), führen Sie dann die Sicherung erneut aus und bestätigen Sie das Aus- und Einschalten, wenn Sie gefragt werden: Der Durchlauf kann es nicht selbst sehen. Der festgehaltene Fehler: {error}',
  'preserve.gate.noErrorText': '(kein Fehlertext)',
  'preserve.gate.patchAfterBackup':
    'der Patch läuft nach der Sicherung: Der Durchlauf liest jeden Bereich, den der Standardplan lesen kann, und speichert ihn dauerhaft, BEVOR irgendetwas anderes geschieht — diese Sicherung ist die einzige Kopie dieser Kamera. Führen Sie zuerst den Sicherungsschritt aus.',
  'preserve.gate.commitAfterBackup':
    'der Commit läuft nach der Sicherung (siehe den Patch-Schritt)',
  'preserve.gate.commitAfterPatch':
    'der Commit läuft nach dem Patch-Schritt, der festhält, was er überträgt',
  'preserve.gate.commitNeedsPatch':
    'der Commit braucht den Patch von {banks}, und der Patch-Schritt hat keinen festgehalten — führen Sie den Patch-Schritt erneut aus',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    'der Commit braucht die Sicherungsdateien im Durchlaufverzeichnis, und sie fehlen: {files} — ohne sie hat ein Commit keine Quelle für die Wiederherstellung, daher lehnt er ab',
  'preserve.gate.drainNoCommit':
    'das volle Auslesen liest den GEPATCHTEN Chip über das erweiterte Fenster, und dieser Durchlauf hat keinen abgeschlossenen Commit — auf einer Kamera im Originalzustand würde das volle Auslesen hängen bleiben. Führen Sie zuerst den Commit aus (oder setzen Sie dort fort), oder springen Sie ausdrücklich (allowJump), wenn der Commit ohne seinen Checkpoint angekommen ist.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'der Schritt des vollen Auslesens lehnt auf {build} ab: {note}',
  'preserve.gate.detectedBuild': 'dem erkannten Build',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'der Schritt des vollen Auslesens lehnt auf {build} ab: Das volle Auslesen auf der ungepatchten Firmware dieses Builds zu starten, lässt die Kamera abstürzen (sie liest von einem Wert, der keine Flash-Adresse ist; auf dem Emulator gemessen: 32 KB geliefert, dann ein Fehler der Kamera). Die Änderung, die das Lesen sicher macht, liegt bei {sites}, und sie gehört nicht zu den Änderungen, die dieser Durchlauf für {bank} festgehalten hat — führen Sie den Patch-Schritt aus (und schließen Sie das Schreiben ab), bevor Sie voll auslesen.',
  'preserve.gate.drainFiles':
    'das volle Auslesen braucht {files} (das gelieferte Abbild wird mit der Aufnahme jedes beschriebenen Slots nachbearbeitet), und das fehlt im Durchlaufverzeichnis',
  'preserve.gate.restoreNoCommit':
    'die Wiederherstellung schreibt die Original-Slots über den Patch zurück, und dieser Durchlauf hat keinen abgeschlossenen Commit — es gibt nichts, was sie rückgängig machen könnte. Führen Sie zuerst den Commit aus (oder setzen Sie dort fort), oder springen Sie ausdrücklich (allowJump), um eine bereits gepatchte Kamera wiederherzustellen.',
  'preserve.gate.restoreNeedsPatch':
    'die Wiederherstellung braucht die Patch-Zusammenfassung jedes beschriebenen Slots (für die übertragene Länge) — führen Sie zuerst den Patch-Schritt aus',
  'preserve.gate.restoreNoForm':
    'der Wiederherstellungsschritt lehnt auf {build} ab: Keine Form der Original-Firmware besteht die eigene Prüfung der Kamera und wird zugleich wieder als die Original-Bytes gespeichert — die Prüfsumme der Original-Firmware ist 0xB7AB9D17 (gemessen), nicht das 0xFFFF, das die Kamera verlangt. Dieser Durchlauf endet mit dem vollständigen Abbild in der Hand und dem Patch an seinem Platz; der ursprüngliche Inhalt kann nur mit einem Programmiergerät für den ganzen Flash-Speicher zurückgebracht werden.',
  'preserve.gate.restoreFiles':
    'die Wiederherstellung braucht {files} (das Original jedes beschriebenen Slots, aus dem Sicherungsschritt), und das fehlt im Durchlaufverzeichnis',
  'preserve.gate.verifyNoRestore':
    'die Prüfung vergleicht einen frischen Start mit der Sicherung, und dieser Durchlauf hat keine abgeschlossene Wiederherstellung — ein gepatchter Slot würde als Abweichung erscheinen. Führen Sie zuerst die Wiederherstellung aus (oder setzen Sie dort fort), oder springen Sie ausdrücklich (allowJump), wenn die Wiederherstellung ohne ihren Checkpoint angekommen ist.',
  'preserve.gate.verifyNeedsBackup':
    'die Prüfung braucht {file} (die Referenz für den Vergleich), und die Datei fehlt im Durchlaufverzeichnis',
  'preserve.gate.needsBanks':
    '{step} braucht die Slots, die der Sicherungsschritt gelesen hat, und der Zustand enthält keine',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'für diesen Durchlauf sind keine Slots gewählt: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} kann nicht beschrieben werden: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'der Patch dieses Builds startet nur aus Recovery-Slot R: {note} — der Durchlauf würde {bank} beschreiben, wo der Bootloader ihn nie ausführt',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'die Datei ist zu klein für einen Image-Header',
  'slots.image.notWordSized': 'die Image-Größe muss ein Vielfaches von 4 sein (erhalten: {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'das Image ist {size} B groß; der Bootloader lehnt jedes header.length >= {limit} ab, daher würde es nie starten',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'kein Image-Header bei {at} (Magic {magic}, erwartet {expected}) — das muss ein entschlüsseltes Seek-Firmware-Image sein, kein verschlüsselter Slot und kein Flash-Abbild',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'der anfängliche Stack-Pointer {address} liegt nicht im LPC43xx-SRAM — das sieht nicht entschlüsselt aus',
  'slots.image.stackUnaligned':
    'der anfängliche Stack-Pointer {address} ist nicht an einer Wortgrenze ausgerichtet',
  'slots.image.notThumb': 'der Reset-Vektor {address} ist keine Thumb-Adresse',
  'slots.image.noKeyPair':
    'der Name dieser Datei trägt nicht ihr Schlüsselpaar, und weder das Paar dieser Kamera noch ein dekodiertes Anwendungspaar kommt genau einmal im Image vor, daher lässt sich nicht sagen, für welche Schlüssel das Image gebaut wurde. Entschlüsselte Dateien werden nach den Schlüsseln benannt, die sie enthalten.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'der Dateiname gibt Schlüssel A {keyA} und Schlüssel B {keyB} an, aber {mismatch}. Beide Schlüssel müssen vorhanden sein, jeder genau einmal.',
  'slots.image.keyInHeader':
    'dieses Image hat einen Schlüssel bei {at}, innerhalb des Klartext-Header-Fensters — Patchen abgelehnt',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'Schlüssel A und Schlüssel B aus dem Dateinamen ergeben überlappende Bytes bei {at} und {other} — es müssen zwei verschiedene 16-Byte-Werte sein',
  'slots.image.retargetLost':
    'nach dem Umstellen auf diese Kamera enthält das Image das Schlüsselpaar dieser Kamera nicht genau einmal — abgelehnt, denn für spätere Upgrades dieser Nutzdaten könnte der Bootloader keinen Schlüssel finden',
  'slots.image.noStageKey':
    'das Image enthält kein Schlüsselpaar der Linie von 2016, daher gibt es keinen Übertragungsschlüssel, um es zu kodieren',
  'slots.image.ffSumNoKeys':
    'dieses Image hat die 16-Hz-FF-Wortsumme 0xFFFF, enthält aber nicht das 1.3.0.8-FF-Schlüsselpaar (beide Hälften, je einmal), daher lässt sich seine übertragene Form nicht bauen. Es wurde nichts geschrieben.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'das ist das 1.3.0.8-FF-Image (16 Hz), das in seiner eigenen Form mit Schlüssel A übertragen wird (ff-form.ts), nicht als Klartext-Image. Es wurde nichts geschrieben.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'der Plan wurde für Firmware {firmware} gebaut, aber die Analyse liest {version}. Der Plan ist veraltet; bauen Sie ihn neu. Es wurde nichts geschrieben.',
  'slots.plan.otherFirmwareUnknown':
    'der Plan wurde für Firmware unbekannter Version gebaut, aber die Analyse liest {version}. Der Plan ist veraltet; bauen Sie ihn neu. Es wurde nichts geschrieben.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'der Plan wurde für die Kamera {planSerial} gebaut, aber die Analyse liest {serial}. Er wird hier nicht geschrieben. Es wurde nichts geschrieben.',
  'slots.plan.cameraUnknownSerial': 'mit unbekannter Seriennummer',
  'slots.plan.unknownSerial': 'eine unbekannte Seriennummer',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, as a label. */
  'slots.plan.otherAddress':
    'der Plan zielt auf {address}, aber {name} dieses Builds liegt bei {at}',
  'slots.plan.notRead': 'die Analyse liest {name} nicht mehr. Es wurde nichts geschrieben.',
  'slots.plan.edited':
    'die Prüfsumme des Plans passt nicht zu seinen Nutzdaten, der Plan wurde also verändert. Es wurde nichts geschrieben.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'die Nutzdaten sind {size} B groß und passen nicht in {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Das Schreiben braucht acknowledgeRisk: true. Es wurde nichts gesendet.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'diese Kamera kann von hier aus kein unverschlüsselt übertragenes Image annehmen: {reason}. Es wurde nichts geschrieben.',
  'slots.plan.noKeyTable':
    'die Analyse nennt die Schlüsseltabelle des Bootloaders dieser Kamera nicht, daher kann das Image nicht auf sie umgestellt werden',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, as a label. CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'der Commit-Status konnte nach CompleteMemoryUpgrade nicht gelesen werden, daher ist {name} möglicherweise teilweise beschrieben. Lesen Sie die Slots erneut, bevor Sie irgendetwas anderes tun, und bewahren Sie Ihre Sicherung auf.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'die Kamera hat das Schreiben in {name} beim Commit mit {status} abgelehnt: {cause}. Es wurde nichts geschrieben; der Slot ist unverändert. Lesen Sie die Slots erneut, bevor Sie irgendetwas anderes tun.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade hat für {name} {status} ({cause}) zurückgegeben: Es wurde nichts programmiert, aber das Löschen hat womöglich begonnen, daher ist der Slot möglicherweise teilweise gelöscht. Lesen Sie die Slots erneut, bevor Sie irgendetwas anderes tun, und bewahren Sie Ihre Sicherung auf.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade hat {status} ({cause}) zurückgegeben — {name} ist möglicherweise teilweise beschrieben. Lesen Sie die Slots erneut, bevor Sie irgendetwas anderes tun, und bewahren Sie Ihre Sicherung auf.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'die Kamera hat beim Übertragen von {name} bei Offset {offset} {status} gemeldet — vor CompleteMemoryUpgrade abgebrochen, daher wurde nichts in den Flash-Speicher geschrieben',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'die Übertragungsprüfsumme passte nicht zu den übertragenen Bytes',
  'commit.cause.unsupported':
    'das Image ließ sich unter den Schlüsseln der Kamera nicht entschlüsseln, oder der Datentyp wird abgelehnt',
  'commit.cause.acceptance':
    'das Image wurde von seiner Annahmeprüfung abgelehnt, bevor irgendetwas gelöscht wurde (die Prüfung hängt vom Build ab)',
  'commit.cause.notArmed': 'es war kein Slot-Upgrade geöffnet',
  'commit.cause.eraseFailed': 'die Löschphase ist fehlgeschlagen',
  'commit.cause.programFailed': 'die Programmierphase ist fehlgeschlagen',
  'commit.cause.verifyFailed': 'die Prüfphase ist fehlgeschlagen',
  'commit.cause.unknown': 'ein hier unbekannter Status',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself':
    '{name} wird nicht auf sich selbst kopiert. Es wurde nichts geschrieben.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Es wurde nichts geschrieben.',
  'copy.refused.noPlain':
    '{name} hat kein entschlüsseltes Image zum Kopieren. Es wurde nichts geschrieben.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} ist eine ZIP-Datei, die hier nicht gelesen werden kann ({error}). Es wurde nichts geschrieben.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} enthält keinen vollständigen Flash-Speicher. Eine ZIP-Datei wird angenommen, wenn sie eine Preserve-Durchlaufdatei mit {preserve} ist (sobald ihr Schritt des vollen Auslesens gelaufen ist), eine ZIP-Datei von „Auslesen & entschlüsseln 4.x/Nano“ ({dump}) oder eine von „Alle Selektoren auslesen“ ({selectors}); diese ZIP-Datei enthält: {names}. Es wurde nichts geschrieben.',
  'restore.refused.noWholeFlashPatched':
    '{file} enthält keinen vollständigen Flash-Speicher. Eine ZIP-Datei wird angenommen, wenn sie eine Preserve-Durchlaufdatei mit {preserve} ist (sobald ihr Schritt des vollen Auslesens gelaufen ist), eine ZIP-Datei von „Auslesen & entschlüsseln 4.x/Nano“ ({dump}) oder eine von „Alle Selektoren auslesen“ ({selectors}); diese ZIP-Datei enthält: {names}. Die Datei {patched} darin ist der Flash-Speicher mit dem vorübergehenden Patch des Durchlaufs, daher wird sie nicht angenommen. Es wurde nichts geschrieben.',
  'restore.refused.zipEmpty': 'nichts',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'eine vollständige Flash-Sicherung ist {full} B groß (4 MB, der ganze Chip, wie J-Link ihn liest); {file} ist {size} B groß. Es wurde nichts geschrieben.',
  'restore.refused.noBank':
    'der Plan dieses Builds hat keinen {bank}. Es wurde nichts geschrieben.',
  'restore.refused.outsideFlash':
    '{name} liegt nicht innerhalb eines 4-MB-Flash-Speichers. Es wurde nichts geschrieben.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} wurde von dem Auslesen, aus dem {file} stammt, nicht gelesen: Laut seiner manifest.json ist {address} eine Lücke. Es gibt kein Image zum Wiederherstellen. Es wurde nichts geschrieben.',
  'restore.refused.gapReason':
    '{where} wurde von dem Auslesen, aus dem {file} stammt, nicht gelesen: Laut seiner manifest.json ist {address} eine Lücke ({gap}). Es gibt kein Image zum Wiederherstellen. Es wurde nichts geschrieben.',
  'restore.refused.gapFill':
    '{where} wurde von dem Auslesen, aus dem {file} stammt, nicht gelesen: Laut seiner manifest.json ist {address} eine Lücke, gefüllt mit {fill}. Es gibt kein Image zum Wiederherstellen. Es wurde nichts geschrieben.',
  'restore.refused.gapReasonFill':
    '{where} wurde von dem Auslesen, aus dem {file} stammt, nicht gelesen: Laut seiner manifest.json ist {address} eine Lücke ({gap}), gefüllt mit {fill}. Es gibt kein Image zum Wiederherstellen. Es wurde nichts geschrieben.',
  'restore.refused.empty':
    '{where} ist leer: Jedes Byte ist 0xFF. Ein Schreibvorgang programmiert ein Image und kann einen Slot nicht gelöscht zurücklassen, daher kann ein leerer Slot nicht durch einen Schreibvorgang wiederhergestellt werden. Es wurde nichts geschrieben.',
  'restore.refused.fill':
    '{where} ist in jedem Byte {fill}, die Füllung, die das Auslesen dort schreibt, wo es nichts gelesen hat: Das Auslesen hat diesen Slot nicht gelesen. Es gibt kein Image zum Wiederherstellen. Es wurde nichts geschrieben.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} kann aus dieser Datei nicht wiederhergestellt werden: {why}. Es wurde nichts geschrieben.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'dieser Build hat keine Schreib-Öffnung für den Slot',
  'support.noStagingEmpty':
    'dieser Build hat keine Übertragungsform, daher wird ein leerer Slot nicht beschrieben',
  'support.buildUnknown': 'der Build ist unbekannt',
  'support.unverifiedStaging':
    'dieser Build liegt auf der gesperrten Linie 0.x/1.x, ist aber keiner der Builds, an denen die Patch-Tabellen des Preserve-Durchlaufs gemessen wurden (0.8.0.0 .. 1.3.0.8 und 1.0.3.0 / 1.0.3.2), daher ist die Übertragungsform seiner Slots unbekannt, und es wird nichts geschrieben',
  'support.unknownFamily':
    'die Familie der Kamera ist nicht bekannt und damit auch nicht der Schlüssel, unter dem ihre Slots geschrieben werden; eine Kamera nimmt einen unter dem falschen Schlüssel geschriebenen Slot an und startet dann nicht daraus. Lesen Sie diese Kamera aus und entschlüsseln Sie sie, bestimmen Sie sie anhand des Flash-Abbilds und nennen Sie dann ihre Familie mit --family.',
  'support.noReadCommand':
    'Firmware älter als 0.8.0.0 hat keinen Lese-Handler für GetFeaturedFirmwareData, den Befehl, mit dem ein Auslesen den Flash-Speicher liest. Auf 0.7.0.7 und 0.7.0.8 steht er in der RPC-Methodentabelle bei 0x4F, ist aber nur als Setter (Schreib-Handler) registriert, daher kann das Control-IN-Lesen, das ein Auslesen sendet, nicht zugestellt werden (der Preserve-Durchlauf liest diese beiden Builds stattdessen über Wire-ID 0x58, GetFeaturedData); vor 0.7.0.7 ist Wire-ID 0x4F UploadFirmwareRowSize, und auf 0.3.0.1 ist Wire-ID 0x52 — die, mit der ein Auslesen öffnet — EnterBootloaderMode statt BeginFirmwareUpgrade: Die Kamera bleibt in ihrer Anwendung, aber jedes Öffnen setzt ein Flash-Ziel und öffnet die Firmware-Upgrade-Phase dieses Builds (GetErrorCode liest danach 0x00400000), was kein Lesefenster ist. Aus den eigenen Methodentabellen der Images gewonnen, beide Handler-Spalten; siehe test/firmware/facts.json.',
  'support.noWritePath':
    'diese Builds nehmen neue Firmware über eine ältere Upgrade-Abfolge an, die dieses Toolkit nicht sendet, und ihre Slots wurden nie kartiert, daher wird nichts geschrieben.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'die Firmware-Version konnte nicht gelesen werden, daher sind der Build, seine Slots und deren Übertragungsform unbekannt; darauf wird nichts gelesen oder geschrieben',
  'support.versionNotDotted':
    'die Firmware-Version „{version}“ ist keine Version mit Punkten, daher sind der Build, seine Slots und deren Übertragungsform unbekannt; darauf wird nichts gelesen oder geschrieben',
  'support.olderThanFirst':
    'Firmware {version} ist älter als {first}: Ihre RPC-Tabelle hat keinen Lese-Handler für GetFeaturedFirmwareData, den Befehl, den ein Slot-Lesen sendet, daher wird an sie weder ein Lese- noch ein Schreibbefehl gesendet (early-compact hat die Belege)',
  'support.modernOnLocked':
    'die Familie modern-4x deckt 2.x, 4.x, 10.x, 42.x und 44.x ab; {version} liegt auf der gesperrten Linie 0.x / 1.x, die legacy-auth oder compact-2016 braucht',
  'support.lockedOnModern':
    'die Familie legacy-auth deckt die gesperrte Linie 0.x / 1.x ab; {version} liegt auf der modernen Linie, die modern-4x braucht',
  'support.notCompactPro':
    'die Familie compact-2016 deckt die Linie 1.0.3.x der Compact PRO ab; {version} liegt nicht darauf',
  'support.earlyCompact':
    'die Familie early-compact deckt nur die Builds älter als {first} ab, und {version} wird über legacy-auth gelesen',
  'support.generic':
    'die Familie der Kamera ist nicht erkannt (Familie generic), daher sind Slot-Layout und Übertragungsform unbekannt; erkennen Sie die Kamera, bevor ein Slot gelesen oder geschrieben wird',
  'support.noPlan':
    'für die Familie {family} gibt es keinen Slot-Plan: Ihr Slot-Layout und ihre Übertragungsform sind nicht bekannt',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'die Tabelle dieses Builds öffnet Modus {mode} bei {address} nicht auf dem einfachen Kanal',
  'support.noArmToken':
    'die Tabelle dieses Builds öffnet Modus {mode} bei {address} nicht auf dem Token-Kanal',
  'support.windowElsewhere':
    'das Preserve-Slot-Fenster für {bank} liegt bei {at}, nicht bei {address}',
  'support.noDumpWindow':
    'die BeginFirmwareUpgrade-Tabelle dieses Builds hat kein Fenster bei {address} für {bank}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} unterstützt {capability} nicht: {reason}',
  'support.capability.dump': 'das Auslesen',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Alle Selektoren auslesen“',
  'support.capability.decrypt': 'das Entschlüsseln',
  'support.capability.deviceInfo': 'das vollständige Lesen im Tab „Info“',
  'support.capability.flash': 'das Beschreiben von Slots',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} bei {address} ist auf diesem Build nicht lesbar: Seine Selektortabelle hat dort kein Fenster, daher wurde dafür nichts geöffnet',
  'slots.unread.missing': '{name} fehlt in der Analyse der Kamera',
  'slots.unread.notRead': '{name} wurde nicht gelesen',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Es wurde nichts geschrieben.',
  'slots.refused.versionUnknown':
    'die Analyse sagt nicht, welche Firmware die Kamera ausführt, und die Slot-Befehle bedeuten auf verschiedenen Builds Verschiedenes. Lesen Sie die Geräteinformationen erneut.',
  'slots.refused.versionUnknownWrite':
    'die Analyse sagt nicht, welche Firmware die Kamera ausführt. Es wurde nichts geschrieben.',
  'slots.refused.emptyInput': 'die Eingabe ist leer',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} ist leer und kann auf diesem Build nicht beschrieben werden: {reason}',
  'slots.refused.noRaw': '{name} kann auf diesem Build keine Rohdaten annehmen: {reason}',
  'slots.refused.noPlain':
    '{name} kann auf diesem Build kein entschlüsseltes Image annehmen: {reason}',
  'slots.refused.noStaging':
    '{name} hat auf diesem Build keine Übertragungsform, daher kann kein Image dafür kodiert werden',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B ist länger als {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'das Image ist {size} B groß, länger als {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'der Bootloader von 2014 nimmt die Prüfsumme dieses Builds in Slot A oder B nicht an und startet Recovery-Slot R (0x14070000), ohne ihn zu prüfen, daher wird der Patch in Recovery-Slot R geschrieben und nirgendwo sonst',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'dieser Build läuft nur aus Recovery-Slot R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'ein Firmware-Slot ist {size} B groß ({kib} KB); diese Datei ist {count} B groß',
  'decryptFile.erasedBank':
    'leer, nichts zu entschlüsseln: alle {size} B lesen sich als 0xFF (ein gelöschter Slot)',
  'decryptFile.erasedHeader':
    'gelöscht: Das Header-Fenster ist vollständig 0xFF, daher enthält der Slot kein Image; es wird nichts entschlüsselt',
  'decryptFile.noHeader':
    'kein Image-Header (Magic {magic}), daher gibt es kein Image zum Entschlüsseln',
  'decryptFile.lengthOutOfRange':
    'header.length {length} liegt außerhalb des gültigen Bereichs; kein Image zum Entschlüsseln',
  'decryptFile.ffKeyB':
    '{size} B unter Schlüssel B von FF 1.3.0.8 entschlüsselt: Das Image ist gespeichert als das Image XOR den Schlüsselstrom seines Schlüsselblocks 1, Header-Fenster unverändert',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'Schlüssel nicht gewonnen: Das Image entschlüsselt sich zu einem Reset-Vektor, der kein Cortex-M-Einsprungpunkt ist (Schlüssel {check}); es wird nichts entschlüsselt',
  'decryptFile.storedPlain':
    'im Klartext gespeichert: Der Slot enthält das Image so, wie es läuft (die Klartext-Kette von 2014, ein Identitäts-Schlüsselstrom), daher gibt es keinen Schlüssel, und das entschlüsselte Image ist das Image selbst',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted':
    '{size} B unter dem aus diesem Slot gewonnenen Schlüssel entschlüsselt ({check})',
  'decryptFile.decryptedNamed':
    '{size} B unter dem aus diesem Slot gewonnenen Schlüssel entschlüsselt ({check}; es ist {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'zu kurz gelesen ({size} B)',
  'read.reason.noParse': 'Image-Header konnte nicht ausgewertet werden',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'kein Image-Header (Magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} liegt außerhalb des gültigen Bereichs',
  'read.reason.stopped': 'Lesen des Slots bei {count}/{size} B angehalten',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'auf Firmware {version} nicht lesbar: Ihr Plan ({table}) hat kein Fenster bei {address}, daher wurde dafür nichts geöffnet',
  'read.reason.notInPlanUnknown':
    'auf Firmware unbekannter Version nicht lesbar: Ihr Plan ({table}) hat kein Fenster bei {address}, daher wurde dafür nichts geöffnet',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'das Fenster hat die Bytes eines veralteten Leser-Deskriptors geliefert — Wort 0 {word} mit Reset {hex} ist die Vektortabelle von 0x14000000, nicht der Inhalt dieses Slots, daher wurde daraus nichts ausgewertet: {remedy}',
  'read.reason.spentReader': 'die Slots der Kamera konnten nicht gelesen werden — {remedy}',
  'read.spentRemedy':
    'der Fenster-Leser ist für diesen Start womöglich erschöpft; schalten Sie die Kamera aus und wieder ein und versuchen Sie es erneut',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'das Aktiv-Slot-Wort der Kamera (fw info roots, Selektor 10) konnte nicht gelesen werden',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'das Aktiv-Slot-Wort der Kamera ist {word}, was keinen Slot bezeichnet',
  'checkKey.unnamed.cfg0NotRead':
    'das Boot-Konfigurationswort wurde nicht gelesen, daher ist nicht bekannt, ob der Bootloader {bank} geprüft hat, bevor er ihn angesprungen hat',
  'checkKey.unnamed.noZeroSum':
    'die Kamera meldet, dass sie aus {bank} gestartet ist, aber {bank} entschlüsselt sich bei diesem Lesen nicht zu einer Wortsumme von null',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'die Kamera meldet, dass sie aus {bank} gestartet ist, den das Boot-Konfigurationswort {word} an die letzte Stelle setzt, daher hat der Bootloader ihn ohne seine Prüfung angesprungen, aber {bank} entschlüsselt sich bei diesem Lesen nicht zu einer Wortsumme von null',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (Bewertung {score} nach dem Lesen, anhand der Hinweise unten)',
  'report.detectedAmbiguous':
    '{family} (Bewertung {score} nach dem Lesen, anhand der Hinweise unten; nicht eindeutig)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'ja',
  'report.cell.no': 'nein',
  'report.cell.notApplicable': 'k. A.',
  'report.cell.unknown': 'unbekannt',
  'report.cell.recoveryOnly': 'nur Recovery',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'Whitening-K',
  'report.keyRow.store': 'Speicherschlüssel',
  'report.keyRow.check': 'Prüfschlüssel',
  'report.keyRow.table': 'Schlüsseltabelle',
  'report.keyRow.keys': 'Schlüssel',
  'report.keyRow.a': 'Schlüssel A',
  'report.keyRow.b': 'Schlüssel B',
  'report.keyRow.tableAt': 'Tabelle bei',
  'report.key.notIdentified': '(nicht erkannt)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} Kandidat, nicht bestätigt',
    other: '{count} Kandidaten, keiner bestätigt',
  },
  'report.key.tableAt': '{offset} im Bootloader-Block, an einem Slot bestätigt',
  'report.key.plainChain':
    'keiner nötig: Die Slots sind als Klartext-Firmware gespeichert, daher wird ein Slot so gelesen und geschrieben, wie er ist',
  'report.key.tableRefused2016':
    'nicht gelesen — der Bootloader-Block (0x14000000) wird auf dieser Linie auf jedem Kanal abgelehnt',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, benannt anhand von {bank}, dem Slot, aus dem die Kamera laut eigener Meldung nach der Prüfung des Bootloaders gestartet ist',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, erschlossen aus {bank}, dem Slot, aus dem die Kamera laut eigener Meldung gestartet ist: Der Bootloader springt diesen Slot ohne seine Prüfung an und führt ihn unter dem Schlüssel aus, unter dem er die anderen Slots prüft',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (Block 1 von {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'dem 9-Hz-Paar der Compact PRO 1.0.3.x',
  'keyPair.cp1032ff': 'dem FF-Paar der Compact PRO 1.0.3.x',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nicht benannt — {why}',
  'report.checkKey.couldNotName': 'das Lesen konnte ihn nicht benennen',
  'report.storeKey.checkKeyUnnamed':
    'der Schlüssel, unter dem ihr Bootloader einen Slot prüft (bei diesem Lesen nicht benannt): Die Anwendung speichert jeden Slot, den sie schreibt, unter diesem Schlüssel',
  'report.storeKey.checkKey':
    '{key}: Die Anwendung speichert jeden Slot, den sie schreibt, unter dem Schlüssel, den ihr Bootloader prüft',
  'report.storeKey.unknown':
    'unbekannt — der Bootloader-Block mit dem Platz für den Geräteschlüssel wurde nicht gelesen',
  'report.storeKey.keyBUnidentified':
    'Schlüssel B (kein Geräteschlüssel programmiert; Schlüssel B selbst nicht erkannt)',
  'report.storeKey.keyB': 'Schlüssel B (kein Geräteschlüssel programmiert)',
  /** How each bank is staged: said after "each bank" (info:report.oneBank). */
  'report.staged.plain': 'unverschlüsselt übertragen (das Image, wie es ist, ohne Schlüssel)',
  'report.staged.slotKeystream': 'unter dem eigenen Schlüsselblock 0 seines Images übertragen',
  'report.staged.keyA':
    'unter Schlüsseln übertragen, die vom gestarteten Slot und der laufenden Anwendung abgeleitet sind',
  'report.staged.ffVendor':
    'so übertragen, wie die Hersteller-App das 16-Hz-FF-Image überträgt (das Image XOR seinen eigenen Schlüsselblock 0), von der Kamera unter Schlüssel B gespeichert',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Sicherung: Block {address}',
  'progress.backupDone': 'Sicherung: jeder Block gelesen',
  'progress.checkBlock': 'Prüfung: Block {address}',
  'progress.checkDone': 'Prüfung: jeder Block gelesen',
  'progress.writingBank': '{bank} wird geschrieben',
  'progress.restoringBank': '{bank} wird wiederhergestellt',
  'progress.staged': '{label}: {done}/{total} B übertragen',
  'progress.wholeFlash': 'Volles Auslesen: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'lese {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'lese {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Fertig — {ok}/{total} Fenster gelesen.',
  'progress.readingBank': '{bank} wird gelesen ...',
  'progress.analysing': 'Wird ausgewertet ...',
  'progress.probeSelector': 'teste Selektor {selector} ...',
  'progress.selectorsArmed': 'Fertig — {armed}/{span} Selektoren aktiviert, {withData} mit Daten.',
  'progress.recoveringKey': 'Entschlüsseln: Schlüssel für {address} wird gewonnen ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) konnte nicht gelesen werden: {error}',
  'slots.read.refusedBuild':
    'Lesen der Firmware-Slots abgelehnt: {reason}. Außer dem Lesen der Version wurde nichts gesendet, daher wurde kein Slot angetastet.',
  'slots.backup.notSaved':
    'die Sicherung {file} wurde nicht gespeichert, daher wurde nichts geschrieben. Ein Schreibvorgang läuft nie, ohne dass seine Sicherung vorher gespeichert ist; versuchen Sie es erneut, sobald sie gespeichert werden kann.',
  'slots.backup.notSavedWhy':
    'die Sicherung {file} wurde nicht gespeichert ({error}), daher wurde nichts geschrieben. Ein Schreibvorgang läuft nie, ohne dass seine Sicherung vorher gespeichert ist; versuchen Sie es erneut, sobald sie gespeichert werden kann.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'High Speed (480 Mbit/s)',
  'usb.speed.full': 'Full Speed (12 Mbit/s)',
  'usb.speed.code': 'Code {code}',
} satisfies Translation<'core'>;
