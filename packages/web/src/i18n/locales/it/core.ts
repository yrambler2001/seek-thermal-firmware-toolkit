/**
 * Namespace `core`, italiano (it), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'la termocamera resta sbloccata finché non viene spenta e riaccesa, e fino ad allora altri strumenti potrebbero leggerla male; spegnila e riaccendila prima di usarli',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'prima {first}, poi {second}, poi {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'non è stato letto',
  'boot.verdict.checkKeyUnnamed':
    'non è stato possibile controllarlo: la chiave con cui il bootloader controlla uno slot non è stata indicata',
  'boot.cfg0NotRead':
    'la parola di configurazione di avvio (cfg[0]) non è stata letta, quindi non si sa quale slot esegue il prossimo avvio',
  'boot.select.unknown':
    'la parola di configurazione di avvio è {word}, quindi il bootloader prova prima {first:acc}, ma {bank:acc} {verdict}, quindi non si sa quale slot viene eseguito',
  'boot.select.first':
    'la parola di configurazione di avvio è {word}, quindi il bootloader prova prima {first:acc}, che contiene un’immagine che il bootloader accetta',
  'boot.select.second':
    'la parola di configurazione di avvio è {word}, quindi il bootloader prova prima {first:acc}; {first:acc} non contiene un’immagine che il bootloader accetti, quindi prende {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'la parola di configurazione di avvio è {word}, quindi il bootloader prova prima {first:acc}; né {first:acc} né {second:acc} contengono un’immagine che il bootloader accetti, quindi avvia {last:acc}, che non controlla',
  'boot.select.lastTakes':
    'la parola di configurazione di avvio è {word}, quindi il bootloader prova prima {first:acc}; né {first:acc} né {second:acc} contengono un’immagine che il bootloader accetti, quindi prende {last:acc}, che non controlla',
  'boot.bootsNow': '{bank:ins} è lo slot da cui la termocamera si avvia ora',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'avviato ora',
  'boot.notBooted': 'non avviato',
  'boot.unknownWhy.checkKeyUnnamed':
    'la chiave con cui il bootloader controlla uno slot non è stata indicata in questa lettura',
  'boot.unknownWhy.noKeyTable':
    'la tabella delle chiavi del bootloader non è stata letta, quindi non si possono indicare le chiavi che prova',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'La termocamera avvia {bank:acc}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: contiene una patch della frequenza dei fotogrammi, ma non viene eseguito, quindi la patch non ha effetto.',
  'fpsBoot.holdsTwo':
    '{banks}: ognuno contiene una patch della frequenza dei fotogrammi, ma nessuno dei due viene eseguito, quindi le patch non hanno effetto.',
  'fpsBoot.wouldNotRun':
    'Applicare la patch {target:dat} non lo farebbe eseguire, perché la termocamera avvia invece {bank:acc}.',
  'fpsBoot.patchRunning':
    'Applica la patch anche {bank:dat} (lo slot che viene eseguito): è questo che rende effettiva la patch della frequenza dei fotogrammi.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: non può ricevere la patch qui ({reason}), quindi una patch della frequenza dei fotogrammi in un altro slot non ha effetto su questa termocamera.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (non è nel piano di questa build: lo zip lo indica)',
  'backup.bank.unsupported': '{name} (questa build non può leggerlo, {reason}: lo zip lo indica)',
  'backup.bank.empty':
    '{name} (vuoto, ogni byte 0xFF: lo zip lo indica, e la scrittura non sovrascrive alcun firmware)',
  'backup.bank.unread':
    '{name} (la lettura degli slot non l’ha raggiunto: lo zip dice se lo raggiunge la lettura prima della scrittura)',
  'backup.bank.noKey':
    '{name} (così come è conservato; nessuna chiave recuperata da questa lettura lo apre, quindi non c’è un file decifrato)',
  'backup.bank.decrypted': '{name} (così come è conservato, e decifrato)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Prima di scrivere qualsiasi cosa, questo slot viene letto di nuovo e salvato in un unico zip ({file}), con una nota su cosa sia ciascun file: {banks}.',
  'backup.plan.many':
    'Prima di scrivere qualsiasi cosa, questi slot vengono letti di nuovo e salvati in un unico zip ({file}), con una nota su cosa sia ciascun file: {banks}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'cifrato in modo che il dispositivo lo conservi con la chiave contenuta nello slot avviato',
  'staging.detail.slotKeystreamCiphertext':
    'cifrato con la chiave di trasferimento dell’immagine stessa (blocco di chiavi 0); la termocamera lo conserva con la chiave propria dello slot',
  'staging.detail.plain': 'in chiaro, senza cifratura',
  'staging.detail.keyAKeystream':
    'l’immagine 1.3.0.8 FF come la trasferisce l’app del produttore (XOR con la chiave A): la build a 16 Hz la conserva con la chiave B, non questi byte',
  'staging.detail.verbatim': 'invariato: i byte esattamente come sono stati forniti',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'nessuna lettura',
  'copy.source.notInPlan': '{name:acc} non è nel piano di questa build',
  'copy.source.notRead':
    '{name:acc} non è stato letto ({reason}), quindi non c’è un’immagine da copiare',
  'copy.source.empty': '{name:acc} è vuoto: non c’è un’immagine da copiare',
  'copy.source.foreign':
    '{name:acc} non contiene un’immagine del firmware che questa lettura riconosca, quindi non c’è nulla da copiare',
  'copy.source.noKey':
    'nessuna chiave recuperata da questa lettura apre {name:acc}, quindi non c’è un’immagine decifrata da copiare',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} all’indirizzo {address}, come l’ha decifrato la lettura degli slot',
  'copy.fromVersion':
    '{name} all’indirizzo {address}, firmware {version}, come l’ha decifrato la lettura degli slot',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'L’immagine è quella {name:gen}, come l’ha decifrata la lettura degli slot: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'L’immagine è quella {name:gen}, come l’ha decifrata la lettura degli slot: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name:acc} (all’indirizzo {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} nel backup completo della flash {file}',
  'restore.fromVersion': '{where} nel backup completo della flash {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'un’immagine della flash da 4 MB',
  'restore.kind.preserve-run': 'un file di esecuzione di Preserve',
  'restore.kind.dump': 'uno zip di Estrai e decifra 4.x/Nano',
  'restore.kind.all-selectors': 'uno zip di Estrai tutti i selettori',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'un’immagine',
  'restore.decryptedTo.firmware': 'il firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'L’immagine è {where} in {file}, {kind}: sha256 conservato {stored}, decifrata in {decrypted} di {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'L’immagine è {where} in {file}, {kind} (la sua voce {entry}): sha256 conservato {stored}, decifrata in {decrypted} di {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Dopo la scrittura, la rilettura dello slot viene confrontata con i byte dello slot conservati nel backup.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Il blocco di identità del backup indica questa termocamera (numero di serie {serial}).',
  'restore.note.sameBytes':
    '{name:ins} contiene già i byte conservati nel backup: la scrittura rimette la stessa immagine.',
  'restore.warn.otherCamera':
    'Questo backup sembra di un’altra termocamera: il suo blocco di identità indica il numero di serie {theirs}, e questa termocamera è {camera}. Viene scritta solo l’immagine {name:gen}; non viene scritto nulla dell’identità o della calibrazione di quella termocamera.',
  'restore.warn.noIdentity':
    'Questo backup non ha un blocco di identità all’indirizzo {address}, quindi non si può dire da quale termocamera sia stato letto.',
  'restore.warn.serialNotRead':
    'Il numero di serie della termocamera non è stato letto, quindi il backup (numero di serie {serial}) non può essere confrontato con essa.',
  'restore.warn.otherFirmware':
    'Nel backup, {where} contiene il firmware {version}, e la termocamera esegue {camera}: il ripristino mette un altro firmware nello slot.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank:ins} non è stato riletto, quindi non viene confrontato con il backup.',
  'restore.readBack.equal': '{bank:ins} si rilegge byte per byte come lo conserva il backup.',
  'restore.readBack.differs':
    '{bank}: la rilettura differisce dai byte conservati nel backup in {count} B (il primo a {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key:acc}, ricavata dallo slot avviato ({bank})',
  'keys.derived.holds':
    '{key:acc} (la chiave di archiviazione), ricavata dallo slot avviato ({bank}), che contiene {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key:acc}, ricavata dallo slot avviato',
  'keys.derived.holdsUnnamed':
    '{key:acc} (la chiave di archiviazione), ricavata dallo slot avviato, che contiene {holds:acc}',
  'keys.ffVendor.staged':
    'l’immagine 1.3.0.8 FF (16 Hz) come la trasferisce l’app del produttore: l’immagine in XOR con il suo blocco di chiavi 0 (chiave A), finestra dell’intestazione invariata, in qualsiasi slot; le chiavi di questa termocamera non vengono usate',
  'keys.ffVendor.stored':
    'Chiave B: la termocamera cifra di nuovo il caricamento con il blocco di chiavi 1 e conserva l’immagine con quella chiave',
  'keys.imageBlock0.staged':
    'l’immagine con il suo blocco di chiavi 0 (trovato nell’immagine per valore), in qualsiasi slot; le chiavi di questa termocamera non vengono usate',
  'keys.imageBlock0.storedUnnamed':
    'la chiave con cui il bootloader controlla uno slot (non indicata in questa lettura); la termocamera cifra di nuovo il caricamento con quella chiave',
  'keys.imageBlock0.stored':
    '{key:acc}, la chiave con cui il bootloader controlla uno slot; la termocamera cifra di nuovo il caricamento con quella chiave',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (non testato): nessun bootloader della build FF a 16 Hz è stato letto da una termocamera, quindi non si sa se lo slot scritto si avvia. Sul bootloader 0.9.0.0 una forma precedente di questa immagine si avviava dallo slot di recupero R; questa forma no, perché quel bootloader avvia lo slot di recupero R così come è conservato, senza decodificarlo.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'L’immagine FF a 16 Hz viene inviata nella forma che legge solo la build {version} a 16 Hz. Questa termocamera scrive uno slot senza controllare l’immagine (lo dice il sorgente del suo firmware, e una Compact 1.3.0.0 ha fatto così quando è stata provata), quindi ci si aspetta che scriva i byte così come vengono inviati: lo slot conterrà allora l’immagine in una forma che questa termocamera non può avviare.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Niente qui afferma che la termocamera la avvii.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Le risposte della termocamera stessa dicono che esegue la build FF a 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'controlla i dati prima di cancellare uno slot, e questi dati superano il controllo, quindi potrebbe scrivere questi byte così come sono, in una forma che il suo bootloader non può avviare: lo slot potrebbe non avviarsi (non provato; il backup salvato prima della scrittura lo rimette com’era)',
  'write.ff.outcome.refuses':
    'controlla i dati prima di cancellare uno slot, e questi dati non superano il controllo, quindi ci si aspetta che rifiuti questa scrittura prima di scrivere qualsiasi cosa (una termocamera con quella build ha rifiutato allo stesso modo una forma precedente di questa immagine)',
  'write.ff.runsSlow':
    'La termocamera esegue la build {version} a 8 Hz: {why}. Quella build {outcome}.',
  'write.ff.buildUnknown':
    'Le risposte della termocamera stessa non dicono quale build {version} esegue: {why}. Se esegue la build FF a 16 Hz, accetta questi dati. Se esegue la build a 8 Hz, quella build {outcome}.',
  'write.raw.asGiven':
    'Dati grezzi: inviati esattamente come sono stati forniti. Niente qui controlla che siano avviabili.',
  'write.raw.ffStagedForm':
    'Questi dati sono la forma trasferita della 1.3.0.8 FF (l’immagine in XOR con il blocco di chiavi 0, somma delle parole 0xFFFF). La termocamera conserva l’immagine con la chiave B, quindi la rilettura viene controllata rispetto a quei byte.',
  'write.raw.noStaging':
    'Questa build non indica alcuna forma di trasferimento per lo slot, quindi non si possono indicare i controlli del bootloader.',
  'write.raw.reencrypts':
    'Il dispositivo decodifica questi dati e cifra di nuovo ciò che conserva, quindi i byte conservati non sono previsti. La rilettura viene controllata come l’immagine in cui si decifra, dove lo si può dire.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Il bootloader rifiuterebbe questi dati: {failure}.',
  'write.raw.stageKeyUnchecked':
    'La chiave di trasferimento del 2016 (blocco di chiavi 0) non è nei byte grezzi, quindi qui non si controlla la somma delle parole di questi dati una volta decifrati.',
  'write.image.rekeyRisk':
    '{name:ins} contiene già un’immagine che il bootloader non può accettare. Questa scrittura porta allo stesso stato.',
  'write.ack.recovery':
    'Slot di recupero R: scriverlo richiede che tu riconosca il rischio. Niente qui controlla che dopo la termocamera si avvii.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: scriverlo richiede che tu riconosca il rischio, e dopo il prossimo spegnimento e riaccensione la termocamera esegue qualunque cosa contenga.',
  'write.ack.bootUnnamed':
    'non è stato possibile indicare lo slot avviato, quindi questo viene trattato come quello avviato',
  'write.ack.recoveryFallback':
    'Lo slot di recupero R è la copia di ultima istanza su cui ripiega il bootloader',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'vuoto/0: preferisce lo slot A, poi B, poi il recupero',
  'boot.cfg0.modernB': 'preferisce lo slot B, poi A, poi il recupero',
  'boot.cfg0.modernRecovery': 'preferisce il recupero, poi A, poi B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'non noto — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'La termocamera sta eseguendo il suo slot di recupero, e il suo stesso aggiornamento scrive {name:loc}, che non sta eseguendo. {verdict} È solo un avviso: niente qui impedisce un aggiornamento.',
  'upgrade.verdict.notRead':
    'Non è stato possibile leggere {name:acc} in questo controllo, quindi non si sa cosa contiene.',
  'upgrade.verdict.blank': '{name:ins} è vuoto, quindi l’aggiornamento scrive in uno slot vuoto.',
  'upgrade.verdict.bootableSame':
    '{name:ins} contiene la stessa immagine avviabile dello slot in esecuzione, che l’aggiornamento sostituisce. {name:ins} resta non avviabile se l’aggiornamento si ferma a metà.',
  'upgrade.verdict.bootable':
    '{name}: contiene un’immagine avviabile, che l’aggiornamento sostituisce. Se l’aggiornamento si ferma a metà, resta non avviabile.',
  'upgrade.verdict.unknown':
    'Per {name:acc} l’avviabilità non è nota in questa lettura, quindi l’aggiornamento potrebbe sostituire un’immagine che la termocamera avvierebbe.',
  'upgrade.verdict.notBootable':
    '{name:ins} non risulta avviabile in questa lettura, quindi l’aggiornamento non sostituisce alcuna immagine che la termocamera avvierebbe.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — lo slot in cui il bootloader è entrato a questo avvio, come lo registra',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'non letto',
  'report.lastStart.noBank': 'la termocamera comunica {word}, che non indica alcuno slot',
  'report.lastStart.entered':
    'la termocamera comunica di essere entrata {bank:loc} (parola dello slot attivo {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'nessuna versione',
  'running.why.otherVersion': 'la termocamera comunica {version}, e solo la {only} ha due build',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'la termocamera non ha risposto ai verdetti sugli slot (selettori 6, 7, 8 di GetFirmwareInfo)',
  'running.why.notRead':
    'uno slot da cui dipendono i verdetti non è stato letto, quindi le risposte non si possono prevedere',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'la termocamera risponde {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, che è ciò che risponde la build 1.3.0.8 a 8 Hz per questi slot ({predicted})',
  'running.why.ff':
    '{answers}, che è ciò che risponde la build 1.3.0.8 FF a 16 Hz per questi slot ({predicted})',
  'running.why.both':
    '{answers}, ed entrambe le build rispondono esattamente così per questi slot, quindi gli slot non le distinguono',
  'running.why.neither':
    '{answers}, che non corrisponde a nessuna delle due build (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'L’intestazione di questa immagine non indica una versione del firmware, quindi non si può dire se è la build che esegue la termocamera ({camera}). Controlla che sia l’immagine che vuoi scrivere.',
  'imageBuild.otherVersion':
    'Questa immagine è il firmware {image}; la termocamera esegue {camera}.',
  'imageBuild.otherVersionTaken':
    'Questa immagine è il firmware {image}; la termocamera esegue {camera}. Su questa linea la termocamera controlla solo che un’immagine sia ben formata (intestazione e somma delle parole), non la sua versione, quindi accetta questa immagine, e quando si avvia da questo slot esegue {image}.',
  'imageBuild.otherVersionUnchecked':
    'Questa immagine è il firmware {image}; la termocamera esegue {camera}. Non è stato verificato se questa termocamera accetti una build diversa, e la esegua.',
  'imageBuild.otherBuild':
    'Questa immagine è la build {version} a 8 Hz; la termocamera esegue la build {version} FF a 16 Hz. Alla conferma della scrittura la build a 16 Hz controlla i dati rispetto alla propria forma FF e rifiuta quelli che non la superano, prima di cancellare lo slot (dal suo sorgente). Scriverci la build a 8 Hz non è stato provato su una termocamera.',
  'imageBuild.runningUnknown':
    'Questa immagine è la build {version} a 8 Hz. La termocamera esegue {version}, che esiste come build a 8 Hz e come build FF a 16 Hz, e le sue risposte non hanno detto quale esegue, quindi non si può dire se questa è la sua build.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'i dati sono {size} B, troppo corti per contenere un’intestazione a 0x200',
  'bootFail.noMagic':
    'nessun magic dell’immagine a 0x200 (trovato {found}, il bootloader richiede {needs})',
  'bootFail.lengthOutside': 'header.length {length} è fuori dai dati di {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} non è la lunghezza dei dati {size}',
  'bootFail.overStage': '{size} B superano lo spazio di trasferimento di {max} B',
  'bootFail.plainSum': 'somma delle parole conservata {sum}, il bootloader del 2014 richiede 0',
  'bootFail.noFooter': 'nessun footer a {offset}: i dati finiscono a {end}',
  'bootFail.footerNotCode':
    'il footer a {offset} non è «CODE»: il bootloader usa il suo loader segmentato',
  'bootFail.footerLength': 'la lunghezza del footer non è uguale a header.length {length}',
  'bootFail.keyASum':
    'decifrata con la chiave A di questa termocamera, la somma delle parole è {sum}; il bootloader richiede {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'verificata con la somma di controllo',
  'keyConfidence.structural': 'verificata solo con la tabella dei vettori',
  'keyConfidence.unverified': 'non verificata',
  /** `{sum}` is hex. */
  'keyCheck.family': 'chiave verificata con la somma di controllo {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'chiave {phrase}; somma di controllo {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'trasferito con le chiavi della termocamera stessa',
  'staging.phrase.slotKeystreamCiphertext': 'trasferito con la chiave dell’immagine stessa',
  'staging.phrase.plain': 'trasferito in chiaro',
  'staging.phrase.keyAKeystream':
    'trasferito come l’app del produttore trasferisce l’immagine FF (XOR con la chiave A)',
  'staging.phrase.verbatim': 'inviato così com’è',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'scrittura confermata di {size} B {name:loc} all’indirizzo {address}, {staged}; stato della conferma {status}',
  'written.noReadWindow':
    'questa build non indica una finestra di lettura per lo slot, quindi non è stato riletto nulla',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'la rilettura non è riuscita: {error}',
  'written.readBack': 'riletti {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'la verifica è disattivata: lo slot non è stato riletto',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'quanto il piano prevedeva per lo slot (l’immagine come la conserva la build a 16 Hz, non i byte inviati)',
  'readBack.reference.asSent':
    'quanto il piano prevedeva per lo slot (i byte così come sono stati inviati)',
  'readBack.sizeDiffers':
    'la rilettura è di {size} B, il piano prevedeva {predictedSize} B: lo slot NON corrisponde a {reference}',
  'readBack.matchesFolded':
    'lo slot contiene l’immagine come la conserva la build a 16 Hz (non i byte inviati), e il resto dello slot è cancellato',
  'readBack.matches':
    'lo slot corrisponde ai byte previsti dal piano (la catena in chiaro del 2014 programma esattamente ciò che riceve)',
  'readBack.differs': 'lo slot NON corrisponde a {reference} (prima differenza a {offset})',
  'readBack.noHeader':
    'la rilettura non contiene un’intestazione d’immagine a {offset} (magic {magic}), quindi lo slot NON si decifra nell’immagine prevista',
  'readBack.lengthDiffers':
    'l’intestazione della rilettura indica {length} B, l’immagine del piano è di {imageLength} B: lo slot NON si decifra nell’immagine prevista',
  'readBack.tooShort':
    'la rilettura è di {size} B, troppo corta per un’immagine di {length} B: lo slot NON si decifra nell’immagine prevista',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'flusso di chiave ricavato dalla rilettura ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'lo slot si decifra nell’immagine prevista ({length} B) con il {recovered}',
  'readBack.decryptDiffers':
    'lo slot NON si decifra nell’immagine prevista: prima differenza all’offset {offset} dell’immagine, con il {recovered}',
  'readBack.rawNotCompared':
    'byte grezzi: rilettura indicata, non confrontata (in questa forma i byte non si decifrano in un’immagine in chiaro prevedibile, e il dispositivo cifra di nuovo ciò che conserva)',
  'readBack.notCompared':
    'nessun confronto possibile: il piano non prevede né i byte conservati né l’immagine in chiaro',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'chiave A',
  'keyName.keyA:acc': 'la chiave A',
  'keyName.keyA:gen': 'della chiave A',
  'keyName.keyA:dat': 'alla chiave A',
  'keyName.keyA:loc': 'nella chiave A',
  'keyName.keyA:ins': 'La chiave A',
  'keyName.keyB': 'chiave B',
  'keyName.keyB:acc': 'la chiave B',
  'keyName.keyB:gen': 'della chiave B',
  'keyName.keyB:dat': 'alla chiave B',
  'keyName.keyB:loc': 'nella chiave B',
  'keyName.keyB:ins': 'La chiave B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'chiave propria del dispositivo',
  'keyName.perDevice:acc': 'la chiave propria del dispositivo',
  'keyName.perDevice:gen': 'della chiave propria del dispositivo',
  'keyName.perDevice:dat': 'alla chiave propria del dispositivo',
  'keyName.perDevice:loc': 'nella chiave propria del dispositivo',
  'keyName.perDevice:ins': 'La chiave propria del dispositivo',
  'keyName.thePerDevice': 'la chiave propria del dispositivo',
  'keyName.thePerDevice:acc': 'la chiave propria del dispositivo',
  'keyName.thePerDevice:gen': 'della chiave propria del dispositivo',
  'keyName.thePerDevice:dat': 'alla chiave propria del dispositivo',
  'keyName.thePerDevice:loc': 'nella chiave propria del dispositivo',
  'keyName.thePerDevice:ins': 'La chiave propria del dispositivo',
  'keyName.applicationKeyA': 'la chiave A dell’applicazione',
  'keyName.applicationKeyA:acc': 'la chiave A dell’applicazione',
  'keyName.applicationKeyA:gen': 'della chiave A dell’applicazione',
  'keyName.applicationKeyA:dat': 'alla chiave A dell’applicazione',
  'keyName.applicationKeyA:loc': 'nella chiave A dell’applicazione',
  'keyName.applicationKeyA:ins': 'La chiave A dell’applicazione',
  'keyName.applicationKeyB': 'la chiave B dell’applicazione',
  'keyName.applicationKeyB:acc': 'la chiave B dell’applicazione',
  'keyName.applicationKeyB:gen': 'della chiave B dell’applicazione',
  'keyName.applicationKeyB:dat': 'alla chiave B dell’applicazione',
  'keyName.applicationKeyB:loc': 'nella chiave B dell’applicazione',
  'keyName.applicationKeyB:ins': 'La chiave B dell’applicazione',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blocco di chiavi 1',
  'keyName.block1:acc': 'il blocco di chiavi 1',
  'keyName.block1:gen': 'del blocco di chiavi 1',
  'keyName.block1:dat': 'al blocco di chiavi 1',
  'keyName.block1:loc': 'nel blocco di chiavi 1',
  'keyName.block1:ins': 'Il blocco di chiavi 1',
  'keyName.theDeviceKey': 'la chiave del dispositivo',
  'keyName.theDeviceKey:acc': 'la chiave del dispositivo',
  'keyName.theDeviceKey:gen': 'della chiave del dispositivo',
  'keyName.theDeviceKey:dat': 'alla chiave del dispositivo',
  'keyName.theDeviceKey:loc': 'nella chiave del dispositivo',
  'keyName.theDeviceKey:ins': 'La chiave del dispositivo',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'chiave sconosciuta',
  'keyName.unknown:acc': 'una chiave sconosciuta',
  'keyName.unknown:gen': 'di una chiave sconosciuta',
  'keyName.unknown:dat': 'a una chiave sconosciuta',
  'keyName.unknown:loc': 'in una chiave sconosciuta',
  'keyName.unknown:ins': 'Una chiave sconosciuta',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'la catena in chiaro del 2014: ogni slot è conservato in chiaro, quindi non si ricava alcuna chiave di caricamento; il caricamento è l’immagine così com’è',
  'keys.evidence.ffVendor':
    'la build 1.3.0.8 FF (16 Hz): nessuno slot aperto da questa lettura è conservato in chiaro, quindi non risulta che la termocamera sia sulla catena in chiaro del 2014; l’immagine FF viene scritta nella forma del produttore, i byte grezzi vengono inviati così come sono e un’immagine in chiaro a 8 Hz non viene scritta',
  'keys.evidence.ffUntested':
    'una scrittura dell’immagine FF viene offerta con il suo avviso UNTESTED (non testato): nel corpus non c’è un bootloader originale per questa build, quindi non è misurato se lo slot scritto si avvia',
  'keys.evidence.line2016':
    'la linea Compact PRO del 2016: un caricamento è l’immagine in XOR con il flusso di chiave del suo blocco di chiavi 0, trovato nell’immagine per valore, quindi nessuna chiave di questa termocamera lo costruisce',
  'keys.evidence.checkKeyUnnamed':
    'la termocamera decifra il caricamento con quella chiave e lo cifra di nuovo con la chiave con cui il suo bootloader controlla uno slot; quella chiave non è stata indicata in questa lettura, e la scrittura non ne ha bisogno: lo slot viene riletto come l’immagine in cui si decifra',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'la termocamera decifra il caricamento con quella chiave e lo cifra di nuovo con la chiave con cui il suo bootloader controlla uno slot; quella chiave non è stata indicata in questa lettura ({why}), e la scrittura non ne ha bisogno: lo slot viene riletto come l’immagine in cui si decifra',
  'keys.evidence.checkKeyNamed':
    'la termocamera decifra il caricamento con quella chiave e lo cifra di nuovo con {key:acc} {hex}, la chiave con cui il suo bootloader controlla uno slot, quindi ogni slot che scrive è conservato come il bootloader lo accetta',
  'keys.evidence.checkKeyInferred':
    'la termocamera decifra il caricamento con quella chiave e lo cifra di nuovo con {key:acc} {hex}, la chiave con cui il suo bootloader controlla uno slot (dedotta in base {bank:dat}, lo slot in cui la termocamera comunica di essere entrata, e in cui il bootloader è entrato senza il suo controllo), quindi ogni slot che scrive è conservato come il bootloader lo accetta',
  'keys.evidence.checkKeyNamedFrom':
    'la termocamera decifra il caricamento con quella chiave e lo cifra di nuovo con {key:acc} {hex}, la chiave con cui il suo bootloader controlla uno slot (indicata in base {bank:dat}, lo slot in cui la termocamera comunica di essere entrata), quindi ogni slot che scrive è conservato come il bootloader lo accetta',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'non è stato possibile indicare lo slot avviato, quindi non se ne può leggere la chiave con cui lo slot è conservato',
  'keys.refused.notDerived': 'non è stato possibile ricavare le chiavi',
  'keys.refused.notDecrypted':
    'lo slot avviato ({bank}) non si decifra in un’immagine, quindi non si può leggere la chiave con cui è conservato',
  'keys.refused.noBootKey':
    'lo slot avviato ({bank}) non si decifra con nessuna chiave che il bootloader prova (la sua chiave A o la sua chiave di archiviazione), quindi non se ne può leggere la chiave con cui lo slot è conservato',
  'keys.refused.keyNotInTable':
    'lo slot avviato ({bank}) si decifra con {key:acc}, ma la tabella delle chiavi di questa termocamera non contiene quella chiave, quindi non si può scrivere con essa',
  'keys.refused.noApplicationPair':
    'l’applicazione in esecuzione ({bank}, firmware {firmware}) non contiene nessuna delle coppie di chiavi note (quella del bootloader e quelle delle applicazioni decodificate) con ciascuna metà esattamente una volta, quindi la sua chiave A non si può individuare nella sua immagine',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'l’applicazione in esecuzione ({bank}, firmware {firmware}) non contiene nessuna delle coppie di chiavi note (quella del bootloader e quelle delle applicazioni decodificate) con ciascuna metà esattamente una volta, quindi la sua chiave A non si può individuare nella sua immagine (la chiave A del bootloader compare {count} volta, la sua chiave B {keyB})',
    many: 'l’applicazione in esecuzione ({bank}, firmware {firmware}) non contiene nessuna delle coppie di chiavi note (quella del bootloader e quelle delle applicazioni decodificate) con ciascuna metà esattamente una volta, quindi la sua chiave A non si può individuare nella sua immagine (la chiave A del bootloader compare {count} di volte, la sua chiave B {keyB})',
    other:
      'l’applicazione in esecuzione ({bank}, firmware {firmware}) non contiene nessuna delle coppie di chiavi note (quella del bootloader e quelle delle applicazioni decodificate) con ciascuna metà esattamente una volta, quindi la sua chiave A non si può individuare nella sua immagine (la chiave A del bootloader compare {count} volte, la sua chiave B {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'l’applicazione in esecuzione ({bank}, firmware {firmware}) controlla un caricamento con le proprie chiavi prima di programmarlo (il sorgente decodificato di questa build prova il caricamento con la sua chiave A e con la sua chiave di archiviazione, come il suo bootloader prova uno slot), e la chiave con cui le scritture conservano gli slot, {key:acc} ({hex}), non è né la sua chiave A né la sua chiave di archiviazione, quindi la termocamera rifiuterebbe il caricamento con 0x50000 prima di cancellare qualsiasi cosa',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'nessuno slot si decifra nella somma di controllo {sum} di {family}',
  'writeRefusal.keyTable':
    'non è stato possibile confermare la tabella delle chiavi di questa termocamera',
  'writeRefusal.whitening':
    'la tabella delle chiavi di questa termocamera si risolve con K={k}, ma {family} cifra con K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'gli indizi dicono che questa termocamera è {detected}, non {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'su questa termocamera non si può scrivere da qui: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Le build di Seek dal 2018 in poi (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 e Nano 300. Un dump legge 63 dei 64 blocchi della flash senza sbloccare nulla; su queste build nessuna lettura raggiunge il blocco a {block}. Il firmware è conservato cifrato. Gli slot si scrivono uno alla volta nella scheda Gestisci gli slot del firmware.',
  'family.summary.early':
    'Le Compact del 2014 precedenti a 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 e 0.7.0.8. Il loro firmware non sa rispondere alla lettura che invia un dump, quindi Avvia il dump, Estrai tutti i selettori, la lettura completa della scheda Info e la scheda Gestisci gli slot del firmware le rifiutano dopo aver letto la versione; su 0.3.0.1 il comando con cui inizia un dump preparerebbe invece un aggiornamento del firmware. L’esecuzione di Preserve legge 0.7.0.7 e 0.7.0.8 tramite un altro comando a cui rispondono quelle due build. Un dump fatto in un altro modo si decifra come al solito.',
  'family.summary.compact2016':
    'Le build Compact PRO 1.0.3.x (1.0.3.0 e 1.0.3.2). Rispondono alle letture esattamente come le Compact del 2014, token di sblocco compreso, quindi si distinguono per la versione e per come sono conservati i loro slot: cifrati, mentre gli slot del 2014 sono in chiaro. Una termocamera 1.0.3.x viene letta con questa famiglia fin dall’inizio. L’esecuzione di Preserve legge l’intera flash, e gli slot si scrivono uno alla volta nella scheda Gestisci gli slot del firmware.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Le Compact del 2014 da 0.8.0.0 a 1.3.0.8, compresa la build 1.3.0.8 FF a 16 Hz. Una termocamera originale lascia uscire meno di metà della sua flash, una parte solo con un token di sblocco che questi strumenti inviano; l’esecuzione di Preserve legge il resto con una patch temporanea. Gli slot sono conservati in chiaro, tranne sulla build FF. Una termocamera Compact PRO 1.0.3.x viene letta come compact-2016, e passa qui solo quando uno slot è conservato in chiaro o si decifra in {sum}, come quelli della build FF. Gli slot si scrivono nella scheda Gestisci gli slot del firmware sulle build su cui è stata misurata l’esecuzione di Preserve; qualsiasi altra build 0.x o 1.x viene solo letta.',
  'family.summary.generic':
    'Una termocamera che non corrisponde a nessun’altra famiglia. `seek-fw dump` la legge con l’elenco dei blocchi 4.x (la scheda 4.x/Nano la rifiuta), e una decifratura ricava la chiave dall’immagine stessa, quindi nessuno dei due dipende dall’ipotesi. Non viene scritto alcuno slot: la scheda Gestisci gli slot del firmware la rifiuta finché la termocamera non è identificata.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'l’intestazione dell’immagine indica',
  'detect.source.camera': 'la termocamera comunica',
  'detect.plainArmedNotInForce':
    'un BeginFirmwareUpgrade semplice da 2 byte ha aperto uno slot protetto, quindi il canale di lettura autenticato non è in vigore',
  'detect.modern.plainRefused':
    'un BeginFirmwareUpgrade semplice da 2 byte su uno slot protetto è stato RIFIUTATO, cosa che nessuna build di questa linea fa: il suo gestore non ha un controllo del token e accetta il canale semplice su ogni slot',
  'detect.modern.authArmed':
    'uno slot protetto è stato aperto con il selettore autenticato da 18 byte; lì nessuno ha provato quello semplice, quindi questo non colloca la termocamera fuori da questa linea',
  'detect.modern.legacyVersion':
    '{said} il firmware {version}, che è sulla linea legacy 0.x / 1.x (una numerazione diversa, non una 4.x più vecchia; e una di quelle build raggiunge anche la somma {sum})',
  'detect.modern.noSum':
    'nessuno slot si decifra nella somma di controllo {sum} richiesta dal bootloader di questa famiglia',
  'detect.modern.sum': 'uno slot si decifra nella somma di controllo {sum}',
  'detect.modern.version':
    'il firmware {version} è sulla linea successiva al 2018 coperta da questa mappa dei selettori (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'un BeginFirmwareUpgrade semplice da 2 byte ha aperto uno slot protetto, quindi non è il firmware legacy bloccato',
  'detect.modern.none': 'nessun indizio colloca questa termocamera sulla linea successiva al 2018',
  'detect.early.noVersion':
    'nessuna versione del firmware è stata comunicata o trovata nell’intestazione di un’immagine',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'il firmware {version} è {first} o successivo, quindi la sua tabella RPC ha un getter per GetFeaturedFirmwareData e vale il normale percorso di lettura',
  'detect.early.older':
    '{said} il firmware {version}, che è precedente a {first}, la prima build la cui tabella dei metodi RPC ha un gestore di lettura (getter) per GetFeaturedFirmwareData',
  'detect.early.noWindow':
    'e non è stato possibile leggere alcuna finestra, proprio come questo prevede',
  'detect.generic.fallback':
    'ripiego: nessuna famiglia di firmware corrisponde con sicurezza, quindi le letture restano disponibili e le scritture no',
  'detect.compact2016.early':
    'il firmware {version} è precedente a 0.8.0.0 e non ha un gestore di lettura per GetFeaturedFirmwareData: è early-compact, non questa famiglia',
  'detect.compact2016.modernSum':
    'uno slot si decifra nella somma di controllo {sum}, che non è il valore di questa generazione',
  'detect.compact2016.plainArmed':
    'un BeginFirmwareUpgrade semplice da 2 byte ha aperto uno slot protetto, quindi questa termocamera non è sulla linea bloccata che questa famiglia condivide con legacy-auth',
  'detect.compact2016.notLine': 'il firmware {version} non è sulla linea 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'uno slot è conservato in chiaro (la soluzione del flusso di chiave restituisce lo stato identità, quindi le sue parole conservate SONO l’immagine), cioè la catena in chiaro del 2014; gli slot di questa generazione sono xorshift128 con una chiave vera',
  'detect.compact2016.keyedZero':
    'uno slot conservato con un vero flusso di chiave xorshift128 si decifra nella somma di controllo {sum}, che è il cifrario di questa generazione',
  'detect.compact2016.zeroSum':
    'uno slot si decifra nella somma di controllo {sum}, che è il valore di questa generazione',
  'detect.compact2016.refused':
    'e uno slot protetto ha rifiutato l’apertura semplice da 2 byte, che è il gestore bloccato',
  'detect.compact2016.proLine':
    '{said} il firmware {version}, la linea 1.0.3.x della Compact PRO del 2016',
  'detect.compact2016.compactLine':
    '{said} il firmware {version}, una build Compact, non la linea 1.0.3.x della Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} il firmware {version}, sulla linea 0.x / 1.x che questa generazione condivide con il firmware legacy bloccato',
  'detect.compact2016.bootloader2016':
    'il bootloader comunica {version}, un bootloader della generazione 2016 (1.2.0.0 è misurato con la Compact PRO 1.0.3.0; quello della Compact del 2014 è 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'il bootloader comunica {version}, la numerazione della generazione 2014, non di questa',
  'detect.compact2016.none':
    'non si è osservato alcuno slot decifrarsi in una somma di controllo zero con una chiave vera',
  'detect.legacy.proLine':
    'ma il firmware {version} è la linea 1.0.3.x della Compact PRO del 2016, i cui slot usano il cifrario di compact-2016: il controllo di accettazione di questa famiglia fallirebbe su ognuno di essi',
  'detect.legacy.early':
    'il firmware {version} è precedente a 0.8.0.0: la sua tabella RPC non ha un gestore di lettura per GetFeaturedFirmwareData (nessuno prima di 0.7.0.7, e solo un setter su 0.7.0.7 e 0.7.0.8): è early-compact, non questa famiglia',
  'detect.legacy.keyedZero':
    'uno slot conservato con un vero flusso di chiave xorshift128 si decifra in {zero}: il cifrario della Compact PRO del 2016 (compact-2016). Questa linea conserva i suoi slot in chiaro con una somma delle parole pari a 0 (la catena del 2014) o con chiave e somma {sum} (Compact 1.3.0.8), e il suo controllo di accettazione fallisce su uno slot del genere',
  'detect.legacy.plainChain':
    'uno slot è conservato come firmware in chiaro le cui parole sommano a 0, come lo avvia il bootloader del 2014 di questa linea',
  'detect.legacy.refused':
    'la termocamera si è rifiutata di aprire uno slot bloccato per un aggiornamento quando le è stato chiesto senza lo sblocco, come fa solo questa generazione di firmware',
  'detect.legacy.unlocked':
    'e ha aperto lo stesso slot quando le è stato chiesto con lo sblocco, quindi lo sblocco che invia questa famiglia è quello che questa termocamera controlla',
  'detect.legacy.notLine': '{said} il firmware {version}, che non è sulla linea legacy 0.x / 1.x',
  'detect.legacy.authOnly':
    'ha aperto uno slot bloccato per un aggiornamento quando le è stato chiesto con lo sblocco, come fa questa generazione di firmware; la richiesta senza sblocco non è stata provata, quindi questo da solo non dimostra la generazione',
  'detect.legacy.version':
    'il firmware {version} è sulla linea legacy 0.x / 1.x, una numerazione diversa da quella delle versioni dell’applicazione successive al 2018, non una 4.x più vecchia',
  'detect.legacy.none': 'nulla di quanto osservato indica il canale di lettura autenticato',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'trattenuta dopo una prova su una termocamera: lì la patch non ha aumentato la frequenza di pubblicazione, e l’otturatore è scattato a ogni fotogramma dopo la scrittura',
  'fps.table.predates':
    'il firmware {version} è precedente a 0.8.0.0: la sua tabella RPC non ha un gestore di lettura per GetFeaturedFirmwareData, il comando che invia la lettura di uno slot, quindi la pagina degli slot non legge né scrive alcuno slot di questa build, e la patch non è proposta',
  'fps.table.stageTwoFf':
    'stage two: la build FF a 16 Hz viene trasferita come la trasferisce l’app del produttore (l’immagine in XOR con la chiave A, conservata con la chiave B), non come byte in chiaro, quindi il suo controllo del trasferimento non è fatto e la patch non è ancora proposta',
  'fps.table.stageTwo':
    'stage two: questa voce non è nell’insieme di stage two, quindi il suo controllo del trasferimento non è fatto e la patch non è ancora proposta',
  'fps.table.notOffered': 'non proposta',
  'fps.table.notImage':
    'questa non è un’immagine del firmware, quindi non le si applica alcuna patch della frequenza dei fotogrammi',
  'fps.table.otherBuild':
    'l’immagine è la build {image}, ma la termocamera comunica {camera}; la patch viene rifiutata invece di essere applicata a una build a cui non corrisponde',
  'fps.table.otherBuildNoVersion':
    'l’immagine è la build {image}, ma la termocamera non comunica alcuna versione; la patch viene rifiutata invece di essere applicata a una build a cui non corrisponde',
  'fps.table.patched':
    'la patch della frequenza dei fotogrammi è già applicata: questa immagine funziona a {hz} Hz',
  'fps.table.earlierPatch':
    'questa immagine contiene una patch della frequenza dei fotogrammi precedente a {hz} Hz senza la correzione USB, e una patch non viene mai applicata a un’immagine già modificata: ripristina l’immagine originale, poi applica la patch',
  'fps.table.atRate': 'questa build funziona già a {hz} Hz senza patch',
  'fps.table.not4821':
    'questa immagine indica la build Compact 4.8.2.1 (o la Compact XR 4.8.2.1, la stessa build) ma non è l’immagine originale per cui è stata scritta la patch della frequenza dei fotogrammi (f96ac57eda75: le sue pagine di comando da 68 byte, pagina stabile 13), quindi non viene creata alcuna patch della frequenza dei fotogrammi',
  'fps.table.notInTable':
    'questa immagine non è nella tabella delle patch della frequenza dei fotogrammi, quindi per questa build non viene creata alcuna patch della frequenza dei fotogrammi. La tabella indica le build Compact da 0.7.0.8 a 1.3.0.8 (8 Hz; 0.7.0.8 è rifiutata dal codice degli slot), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 e 4.16.1.7 FF e le build Compact PRO 1.0.3.x e 4.9.x; nessun’altra build ha una voce',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'il piano di questa build non ha {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank:acc} non può ricevere un’immagine decifrata su questa build: {reason}',
  'fps.plan.empty': '{bank:acc} non ha un’immagine decifrata a cui applicare la patch (è vuoto)',
  'fps.plan.noImage':
    '{bank:acc} non ha un’immagine decifrata a cui applicare la patch (non è stato letto o nessuna chiave lo apre)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name:ins} è stato scritto, ma la sua rilettura non differisce dallo slot salvato solo come previsto, quindi gli slot successivi non sono stati scritti',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Sola lettura. La disposizione degli slot è la tabella decodificata della linea bloccata, ma per questa build non è stata misurata alcuna forma di trasferimento, quindi non è prevista alcuna scrittura.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'la termocamera non ha comunicato la versione del firmware ({note}); un numero di comando non significa la stessa cosa su ogni firmware Seek (sulla Compact 0.3.0.1 il wire id 0x52, quello che apre una finestra di lettura, è EnterBootloaderMode), quindi finché la versione non è nota non viene inviato altro che GetErrorCode, GetOperationMode e GetFirmwareInfo, le letture a cui ogni build risponde allo stesso modo',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo non ha risposto ({error}) a nessuna delle {reads} letture a {spacing} ms l’una dall’altra, una finestra di avvio di {window} ms; una termocamera che si sta ancora avviando risponde entro questo tempo',
  'identity.note.neverTwice':
    'GetFirmwareInfo non ha mai risposto due volte di seguito in {reads} letture',
  'identity.note.noAnswer': 'GetFirmwareInfo non ha risposto ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo non ha risposto ({error}); {answered} letture su {reads} hanno avuto risposta, mai due di seguito, quindi nessuna si può distinguere da un record lasciato selezionato da un comando precedente',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo ha risposto con {count} byte, troppo pochi per una versione',
    many: 'GetFirmwareInfo ha risposto con {count} di byte, troppo pochi per una versione',
    other: 'GetFirmwareInfo ha risposto con {count} byte, troppo pochi per una versione',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo ha risposto con {count} byte, troppo pochi per una versione; {context}',
    many: 'GetFirmwareInfo ha risposto con {count} di byte, troppo pochi per una versione; {context}',
    other: 'GetFirmwareInfo ha risposto con {count} byte, troppo pochi per una versione; {context}',
  },
  'identity.note.otherRecord':
    'la prima lettura ha risposto con un record diverso ({version}), su cui un comando precedente aveva lasciato il selettore delle informazioni sul firmware: quella lettura lo ha azzerato',
  'identity.note.afterStartup': {
    one: 'ha risposto dopo aver rifiutato {count} lettura durante l’avvio',
    many: 'ha risposto dopo aver rifiutato {count} di letture durante l’avvio',
    other: 'ha risposto dopo aver rifiutato {count} letture durante l’avvio',
  },
  'identity.predates':
    'il firmware {version} è precedente al protocollo di dump: la sua tabella dei metodi RPC non ha un gestore di lettura per GetFeaturedFirmwareData (su 0.7.0.7 e 0.7.0.8 è registrato solo come setter, e prima di allora il wire id 0x4F è UploadFirmwareRowSize), quindi non si può leggere alcuna finestra con esso; su 0.3.0.1 il wire id 0x52 è EnterBootloaderMode invece di BeginFirmwareUpgrade. L’esecuzione di Preserve legge invece 0.7.0.7 e 0.7.0.8 tramite il wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'rifiuto di {operation}: {reason}',
  'identity.refusingNoVersion':
    'rifiuto di {operation}: {reason}. Non è stato aperto nulla. Scollega la termocamera, ricollegala, lascia che finisca di avviarsi e riprova.',
  'identity.operation.dump': 'fare il dump',
  'identity.operation.dumpAll': 'estrarre tutti i selettori',
  'identity.operation.readInfo': 'leggere le informazioni del dispositivo',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'gli slot si scelgono dopo il backup, che li legge: esegui prima il backup',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'gli slot non possono più cambiare dopo che la scrittura è stata eseguita o tentata; slot scritti da questa esecuzione: {banks}. Il ripristino rimette esattamente quelli',
  'preserve.banks.none': 'nessuno',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Scritto.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Letto. {count}/{of} slot leggibili.',
  'status.readRefused':
    'Letto, ma nessuno slot di questa termocamera può essere scritto da qui: vedi il registro.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Versione del firmware',
  'compare.field.imageId': 'Id dell’immagine',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'SP iniziale',
  'compare.field.resetVector': 'Vettore di reset',
  'compare.field.size': 'Dimensione',
  'compare.field.shaExpected': 'SHA-256 dell’immagine in chiaro prevista',
  'compare.field.sha': 'SHA-256 dell’immagine',
  'compare.field.shaNotStored':
    'SHA-256 dell’immagine in chiaro prevista (byte conservati non previsti)',
  'compare.field.key': 'Chiave',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(nessuna immagine)',
  'compare.notImage': '(non è un’immagine)',
  'compare.notPredicted': '(non previsto: decide il dispositivo cosa conservare)',
  'compare.plaintext': 'nessuna (in chiaro)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'non è stato possibile leggerlo due volte allo stesso modo',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (la chiave con cui il bootloader controlla uno slot è dedotta in base {bank:dat}, in cui è entrato senza il suo controllo) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, come lo registra la termocamera (parola dello slot attivo {word})',
  'preserve.lastStart.notRead':
    'non noto: non è stato possibile leggere la parola dello slot attivo',
  'preserve.lastStart.noBank':
    'non noto: la parola dello slot attivo è {word}, che non indica alcuno slot',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'non noto — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'non scritto — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'un’immagine',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — può essere scritto',
  'preserve.bank.writablePatch': '{build} — può essere scritto; la patch cambia {count} byte',
  'preserve.bank.writableEdit': '{build} — può essere scritto; contiene {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — può essere scritto; la patch cambia {count} byte; contiene {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'il backup non ha ancora letto gli slot, quindi non si può scegliere alcuno slot',
  'preserve.choice.every': 'ogni slot che contiene un’immagine: {banks}',
  'preserve.choice.everyBlocked':
    'non si possono scrivere tutti gli slot che contengono un’immagine: {bank:acc} non si può scrivere — {reason}',
  'preserve.choice.noImage': 'nessuno slot contiene un’immagine che l’esecuzione può scrivere',
  'preserve.choice.nextStart': '{bank}, lo slot in cui entra il prossimo avvio: {why}',
  'preserve.choice.nextStartRefused':
    'il prossimo avvio entra {bank:loc} ({why}), e l’esecuzione non può scriverlo: {reason}',
  'preserve.choice.everyUnknownStart':
    'ogni slot che contiene un’immagine ({banks}): non si sa in quale slot entra il prossimo avvio ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'non si sa in quale slot entra il prossimo avvio ({why}), e {reason}; scegli uno slot per nome',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank:acc} non può essere scritto: {reason}',
  'preserve.choice.byName': '{banks}, lo slot scelto per nome',
  'preserve.choice.warnNotPatched':
    'Il prossimo avvio entra {bank:loc} ({why}), e questa scelta non gli applica la patch: dopo il riavvio la termocamera esegue l’immagine propria di quello slot, quindi la lettura completa si ferma prima di leggere qualsiasi cosa. Il ripristino rimette comunque a posto ogni slot scritto.',
  'preserve.choice.warnUnknownStart':
    'Non si sa in quale slot entra il prossimo avvio ({why}). Se entra in uno slot a cui questa scelta non applica la patch, la lettura completa si ferma prima di leggere qualsiasi cosa.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'non ancora nota',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'come lo conserva la termocamera (questa termocamera tiene il firmware non cifrato)',
  'preserve.stagedForm.oneKey':
    'nella forma in cui lo conserva la termocamera (cifrato con la chiave della termocamera)',
  'preserve.stagedForm.twoKeys':
    'nella forma in cui lo conserva la termocamera (cifrato con le due chiavi della termocamera)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'ogni slot scritto riceve di nuovo esattamente i byte che il backup ne ha letto',
  'preserve.restoreForm.factoryStaged':
    'ogni slot scritto riceve di nuovo il firmware originale, scritto nella forma in cui lo conserva la termocamera, così lo slot torna byte per byte come l’ha letto il backup',
  'preserve.restoreForm.none':
    'non possibile su questa build: nessuna forma del firmware originale supera il controllo della termocamera e allo stesso tempo viene conservata come i byte originali, quindi l’esecuzione termina con l’immagine completa e la patch ancora presente',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'non possibile su questa build: il firmware con la patch non può leggere l’intera flash, quindi l’esecuzione non ha un’immagine completa da fornire',
  'preserve.drain.rotated':
    'la termocamera la fornisce ruotata, e l’esecuzione la rimette in ordine',
  'preserve.drain.hazard': 'la patch evita una lettura che su questa build blocca la termocamera',
  'preserve.drain.whole': 'l’intera flash da 4 MB in una sola lettura, {size} byte alla volta',
  'preserve.drain.wholeNotes':
    'l’intera flash da 4 MB in una sola lettura, {size} byte alla volta; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'permette al comando di lettura della termocamera di raggiungere l’intera flash da 4 MB, non solo i primi 64 KB',
  'preserve.site.countPast':
    'permette alla posizione di lettura di superare i 64 KB, così una lettura non ricomincia dall’inizio',
  'preserve.site.keepPosition':
    'mantiene l’intera posizione di lettura quando avanza dopo ogni lettura',
  'preserve.site.savePosition': 'salva per intero la posizione di lettura avanzata',
  'preserve.site.clearPosition':
    'azzera l’intera posizione di lettura ogni volta che inizia una lettura, così la termocamera si può ancora leggere dopo la lettura completa',
  'preserve.site.modeTwoGuard':
    'permette alla lettura completa di iniziare come qualsiasi altra lettura (il firmware originale la respinge)',
  'preserve.site.modeTwoIndirection':
    'punta la lettura completa all’inizio della flash (il firmware originale la punta a un valore che blocca la termocamera)',
  'preserve.site.armTail':
    'rimuove una chiamata che su questa build blocca la termocamera quando inizia una lettura',
  'preserve.site.other': 'cambia un’istruzione di cui ha bisogno la lettura completa',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Backup',
  'preserve.step.patch': 'Patch',
  'preserve.step.commit': 'Scrittura',
  'preserve.step.drain': 'Lettura completa',
  'preserve.step.restore': 'Ripristino',
  'preserve.step.verify': 'Verifica',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'patch',
  'preserve.stepId.commit': 'scrittura',
  'preserve.stepId.drain': 'lettura completa',
  'preserve.stepId.restore': 'ripristino',
  'preserve.stepId.verify': 'verifica',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: fermato come previsto; la termocamera ha avviato {bank:acc}, a cui questa esecuzione non ha applicato la patch, quindi non è stato letto nulla.',
  'preserve.result.noReason': 'nessun motivo registrato',
  'preserve.result.stopped': '{label}: fermato — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'nessuno slot contiene firmware a cui l’esecuzione possa applicare la patch',
  'preserve.result.writable.one':
    '{banks:acc} contiene firmware a cui l’esecuzione può applicare la patch',
  'preserve.result.writable.many':
    '{banks:acc} contengono firmware a cui l’esecuzione può applicare la patch',
  'preserve.result.backup':
    '{label}: è stato salvato ogni blocco che una lettura normale raggiunge; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'non noto',
  'preserve.result.backupNext':
    '{label}: è stato salvato ogni blocco che una lettura normale raggiunge; {writable}; slot del prossimo avvio: {next}.',
  'preserve.result.patch': '{label}: preparata per {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: nessuna patch preparata: nessuno slot contiene firmware a cui l’esecuzione possa applicare la patch.',
  'preserve.result.patchCount':
    '{label}: preparata per {banks:acc}; in ciascuno cambiano {count} byte.',
  'preserve.result.commitOne':
    '{label}: {banks:acc} scritto con la patch, e la termocamera l’ha accettato.',
  'preserve.result.commitMany':
    '{label}: {banks:acc} scritti con la patch, e la termocamera li ha accettati tutti.',
  'preserve.result.drainNotRead': '{label}: non letto.',
  'preserve.result.drain':
    '{label}: è stata letta l’intera flash da 4 MB; l’immagine completa ha sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: è stata letta l’intera flash da 4 MB tramite {bank:acc}; l’immagine completa ha sha256 {sha256}.',
  'preserve.result.restore': '{label}: riscrittura completata per {banks:acc}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: riscrittura completata per {banks:acc}, {form}.',
  'preserve.result.verifyDone': '{label}: fatto.',
  'preserve.result.verifyIdentical':
    '{label}: {blocks} blocchi riletti, 0 byte diversi: la flash della termocamera è identica byte per byte al backup.',
  'preserve.result.verifyDiffers': '{label}: {blocks} blocchi riletti, {bytes} byte diversi.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: {blocks} blocchi riletti, {bytes} byte diversi, {count} blocco non leggibile.',
    many: '{label}: {blocks} blocchi riletti, {bytes} byte diversi, {count} di blocchi non leggibili.',
    other:
      '{label}: {blocks} blocchi riletti, {bytes} byte diversi, {count} blocchi non leggibili.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Fermato prima della lettura completa: la termocamera ha avviato uno slot a cui questa esecuzione non ha applicato la patch, quindi non è stato letto nulla.',
  'preserve.unpatchedStart.next':
    'Prossimo passo: il ripristino rimette a posto ogni slot scritto. La lettura completa non viene ritentata: la termocamera avvierebbe lo stesso slot.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Fatto: il tuo firmware è conservato',
  'preserve.done.detail':
    'L’immagine completa è l’intera flash originale della termocamera, e la termocamera stessa è tornata esattamente com’era.',
  'preserve.done.titleNoImage':
    'Fatto: la termocamera è tornata com’era; non c’è un’immagine completa',
  'preserve.done.detailNoImage':
    'La lettura completa non è stata eseguita, quindi questa esecuzione non ha un’immagine completa della flash. Ogni slot scritto è stato rimesso a posto, e una nuova lettura dei blocchi raggiunti da un dump normale corrisponde al backup. Per l’immagine completa, avvia una nuova esecuzione con una scelta che includa lo slot in cui entra il prossimo avvio.',
  'preserve.done.detailNoImageCount':
    'La lettura completa non è stata eseguita, quindi questa esecuzione non ha un’immagine completa della flash. Ogni slot scritto è stato rimesso a posto, e una nuova lettura dei {blocks} blocchi raggiunti da un dump normale corrisponde al backup. Per l’immagine completa, avvia una nuova esecuzione con una scelta che includa lo slot in cui entra il prossimo avvio.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'il lettore di finestre della termocamera ha un limite per ogni avvio e queste letture vengono da un lettore esaurito: spegni e riaccendi la termocamera (scollegala e ricollegala, o usa il suo interruttore), poi esegui di nuovo `preserve --resume <run-directory>`. Firma: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'il lettore di finestre della termocamera ha un limite per ogni avvio e queste letture vengono da un lettore esaurito: spegni e riaccendi la termocamera (scollegala e ricollegala, o usa il suo interruttore), poi esegui di nuovo `preserve --resume <run-directory>`. Firma: {signature}; da questi byte non si può ricavare alcun testo in chiaro di fabbrica. È stato provato ogni modo di leggerlo:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'il backup non contiene {bank:acc} ({address}): le finestre originali non possono fornirlo',
  'preserve.fail.readsDisagree':
    'le due letture {bank:gen} non coincidono (sha256 {sha256} contro {other}): una termocamera che non riesce a fornire due volte di seguito lo slot che esegue non è una termocamera su cui scrivere; l’acquisizione è la fonte del ripristino e il dato di partenza della patch',
  'preserve.fail.notFactory':
    '{bank:ins} non contiene l’immagine di fabbrica come la conserva il cifrario di questa build (il prefisso previsto dell’immagine non corrisponde all’acquisizione): rifiutato prima di registrare qualsiasi cosa, e tanto meno di scriverla',
  'preserve.fail.ffSum':
    'il firmware con la patch, nella forma in cui lo conserva la termocamera, non supera il controllo di questa build (la sua somma deve essere {sum}): non viene inviato uno slot che la termocamera rifiuterebbe dopo la cancellazione',
  'preserve.fail.headChanged':
    'l’inizio {bank:gen} è cambiato dopo il backup (non contiene né l’acquisizione originale né i byte con la patch): nessuna scrittura su uno stato dello slot sconosciuto; non è stato scritto nulla. Hex dell’inizio: attuale {live} contro acquisizione {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:ins} contiene già i byte con la patch: la scrittura è andata a segno in un tentativo precedente e non deve essere ripetuta. Riprendi dal passaggio di lettura completa (--resume), che avvia l’immagine con la patch e continua da lì.',
  'preserve.fail.landed':
    'Questi slot contengono già i byte con la patch ({banks}): la scrittura è andata a segno in un tentativo precedente e non deve essere ripetuta. Riprendi dal passaggio di lettura completa (--resume), che avvia l’immagine con la patch e continua da lì.',
  'preserve.fail.drainRebootRefused':
    'il comando di riavvio della lettura completa è stato RIFIUTATO dall’host prima di partire (un SecurityError: una regola del browser o una protezione di test), quindi la termocamera esegue ancora l’immagine con cui si è avviata, non la patch scritta. La lettura completa legge solo tramite la finestra allargata dell’immagine con la patch, quindi si ferma prima di aprire qualsiasi cosa; non è stato letto nulla. Esegui di nuovo la lettura completa dove l’host lascia passare il comando di riavvio.',
  'preserve.fail.shiftedRebootRefused':
    'la lettura completa è tornata spostata di una pagina, e il riavvio che serve per un altro avvio è stato RIFIUTATO dall’host prima di partire (un SecurityError: una regola del browser o una protezione di test): un altro tentativo leggerebbe lo stesso avvio spostato. Non è stato conservato nulla; esegui di nuovo la lettura completa dove il reset può partire.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'la verifica ha letto {count} byte diverso su {read}/{total} finestre: il chip non si rilegge identico byte per byte al backup',
    many: 'la verifica ha letto {count} di byte diversi su {read}/{total} finestre: il chip non si rilegge identico byte per byte al backup',
    other:
      'la verifica ha letto {count} byte diversi su {read}/{total} finestre: il chip non si rilegge identico byte per byte al backup',
  },
  'preserve.fail.verifyIn': {
    one: 'la verifica ha letto {count} byte diverso su {read}/{total} finestre (in {places}): il chip non si rilegge identico byte per byte al backup',
    many: 'la verifica ha letto {count} di byte diversi su {read}/{total} finestre (in {places}): il chip non si rilegge identico byte per byte al backup',
    other:
      'la verifica ha letto {count} byte diversi su {read}/{total} finestre (in {places}): il chip non si rilegge identico byte per byte al backup',
  },
  'preserve.fail.verifyShort': {
    one: 'la verifica ha letto {count} byte diverso su {read}/{total} finestre (finestre corte: {short}): il chip non si rilegge identico byte per byte al backup',
    many: 'la verifica ha letto {count} di byte diversi su {read}/{total} finestre (finestre corte: {short}): il chip non si rilegge identico byte per byte al backup',
    other:
      'la verifica ha letto {count} byte diversi su {read}/{total} finestre (finestre corte: {short}): il chip non si rilegge identico byte per byte al backup',
  },
  'preserve.fail.verifyInShort': {
    one: 'la verifica ha letto {count} byte diverso su {read}/{total} finestre (in {places}) (finestre corte: {short}): il chip non si rilegge identico byte per byte al backup',
    many: 'la verifica ha letto {count} di byte diversi su {read}/{total} finestre (in {places}) (finestre corte: {short}): il chip non si rilegge identico byte per byte al backup',
    other:
      'la verifica ha letto {count} byte diversi su {read}/{total} finestre (in {places}) (finestre corte: {short}): il chip non si rilegge identico byte per byte al backup',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'il blocco della configurazione di avvio',
  'preserve.fail.dataBlock': 'un blocco di dati',

  'preserve.refused.secondRead': 'la sua seconda lettura non è riuscita ({error})',
  'preserve.refused.readsDisagree':
    'le sue due letture non coincidono (sha256 {sha256} contro {other})',
  'preserve.refused.erased': 'è cancellato',
  'preserve.refused.watchdogMark':
    'la sua parola d’intestazione a +0x200 contiene {word}, il segno che il bootloader scrive su uno slot dopo un reset del watchdog all’inizio di un avvio; il bootloader non accetta più questo slot, e l’esecuzione non ha lì un’immagine a cui applicare la patch',
  'preserve.refused.noHeader': 'non contiene un’intestazione d’immagine a +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'contiene {image} ({id}), non la build che esegue la termocamera ({camera})',
  'preserve.refused.otherKey':
    'il controllo del bootloader lo rifiuta: è conservato con una chiave diversa da quella con cui il bootloader di questa termocamera controlla gli slot, e una scrittura tramite la termocamera lo conserverebbe con quella chiave, quindi il ripristino non potrebbe rimetterne i byte esatti',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'la termocamera comunica il firmware {camera}, serve {version}: la patch è ricavata dai byte di una build e non deve essere inviata a un’altra',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'il firmware {version} non è una build 0.x o 1.x, e questa esecuzione copre solo le build del 2014 e del 2016. Non è stato letto nulla oltre alla versione. Leggi invece questa termocamera con Estrai e decifra 4.x/Nano: legge la flash senza patch, ogni blocco tranne quello a 0x14060000, che su quelle build nessuna finestra di lettura raggiunge.',
  'preserve.refused.preWidening':
    'il firmware {version} è precedente al percorso di allargamento, e l’esecuzione si rifiuta invece di scrivere su uno slot che non può rileggere. Su questa generazione la termocamera respinge ogni modo di avviare la lettura che serve al percorso (misurato su 0.3.0.1), il suo comando di lettura non raggiunge l’inizio della flash, e la dimensione che la patch cambierebbe è conservata in un altro modo. Non ha nemmeno una lettura utilizzabile da un dump normale. Non è stato letto nulla oltre alla versione.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'contiene un’immagine sconosciuta (non il firmware {version} originale, né una sua modifica che Preserve conosce), quindi Preserve non le applica la patch e non la rimette a posto',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'contiene una build nota con la frequenza dei fotogrammi modificata: il firmware {version} originale con la patch della frequenza dei fotogrammi a {hz} Hz. Preserve applica la patch solo al firmware originale, mai a un’immagine già modificata, quindi non applica la patch a questo slot e non lo rimette a posto',
  'preserve.image.frameRateEarlier':
    'contiene una build nota con la frequenza dei fotogrammi modificata: il firmware {version} originale con una patch della frequenza dei fotogrammi precedente a {hz} Hz (fatta prima che vi si aggiungesse la correzione USB). Preserve applica la patch solo al firmware originale, mai a un’immagine già modificata, quindi non applica la patch a questo slot e non lo rimette a posto',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '{what}. Per includere questo slot, prima riscrivici l’immagine originale (per esempio da un backup completo della flash fatto prima della modifica), poi avvia una nuova esecuzione',
  'preserve.image.frameRateWords':
    '{what}. Per includere questo slot, prima riscrivici l’immagine originale (per esempio da un backup completo della flash fatto prima della patch della frequenza dei fotogrammi), poi avvia una nuova esecuzione; in seguito la patch della frequenza dei fotogrammi si può rifare sull’immagine originale',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name}: {what}. L’esecuzione prende da questo slot il firmware a cui applica la patch, quindi si ferma qui, prima di scrivere qualsiasi cosa. Per conservare questa termocamera, prima riscrivi l’immagine originale {bank:loc} (per esempio da un backup completo della flash fatto prima della modifica), poi avvia una nuova esecuzione.',
  'preserve.image.frameRateRefusal':
    '{name}: {what}. L’esecuzione prende da questo slot il firmware a cui applica la patch, quindi si ferma qui, prima di scrivere qualsiasi cosa. Per conservare questa termocamera, prima riscrivi l’immagine originale {bank:loc} (per esempio da un backup completo della flash fatto prima della patch della frequenza dei fotogrammi), poi avvia una nuova esecuzione; in seguito la patch della frequenza dei fotogrammi si può rifare sull’immagine originale.',
  'preserve.image.otherFirmware':
    'contiene il firmware {image}, non il {camera} che esegue la termocamera',
  'preserve.image.otherFirmwareRefusal':
    '{name}: contiene il firmware {image}, non il {camera} che esegue la termocamera, quindi questa esecuzione non ha lì un’immagine a cui applicare la patch e si rifiuta invece di sovrascriverlo.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'non se ne ricava alcuna immagine a cui l’esecuzione possa applicare la patch ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone':
    'questa esecuzione è terminata: ogni passaggio è completato (esecuzione {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'il passaggio {step} è già completato in questa esecuzione (terminato {finished}): la ripresa continua da {next}',
  'preserve.gate.stepDoneUnknownTime':
    'il passaggio {step} è già completato in questa esecuzione (terminato in un momento sconosciuto): la ripresa continua da {next}',
  'preserve.gate.backupRerun':
    'il backup non può essere rieseguito: questa esecuzione ha già completato {steps} e il suo passaggio successivo è {next}; usa --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'il tentativo di backup precedente non è riuscito, e la termocamera deve essere SPENTA E RIACCESA prima di eseguire di nuovo questo passaggio: un nuovo tentativo sullo stesso avvio può leggere byte vecchi o vuoti (misurato: un backup ripetuto ha letto la parola di avvio del bootloader al posto del record della configurazione di avvio). Spegni e riaccendi la termocamera (scollegala e ricollegala, o usa il suo interruttore), poi esegui di nuovo il backup e conferma lo spegnimento e la riaccensione quando ti viene chiesto: l’esecuzione non può vederlo. L’errore registrato: {error}',
  'preserve.gate.noErrorText': '(nessun testo di errore)',
  'preserve.gate.patchAfterBackup':
    'il passaggio {step} viene eseguito dopo il backup: l’esecuzione fa il dump di ogni regione che il piano originale può leggere e lo salva PRIMA di qualsiasi altra cosa; quel backup è l’unica copia di questa termocamera. Esegui prima il passaggio di backup.',
  'preserve.gate.commitAfterBackup':
    'il passaggio {step} viene eseguito dopo il backup (vedi il passaggio della patch)',
  'preserve.gate.commitAfterPatch':
    'il passaggio {step} viene eseguito dopo il passaggio della patch, che registra cosa trasferisce',
  'preserve.gate.commitNeedsPatch':
    'il passaggio {step} richiede la patch {banks:gen}, e il passaggio della patch non ne ha registrata nessuna: esegui di nuovo il passaggio della patch',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    'il passaggio {step} richiede i file del backup nella cartella dell’esecuzione, e mancano: {files}; senza di essi una scrittura non ha una fonte per il ripristino, quindi si rifiuta',
  'preserve.gate.drainNoCommit':
    'il passaggio {step} legge il chip CON LA PATCH tramite la finestra allargata, e questa esecuzione non ha una scrittura completata: su una termocamera originale la lettura completa si bloccherebbe. Esegui prima la scrittura (o riprendi da lì), oppure salta esplicitamente (allowJump) se la scrittura è andata a segno senza il suo punto di controllo.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'il passaggio di lettura completa si rifiuta su {build}: {note}',
  'preserve.gate.detectedBuild': 'la build rilevata',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'il passaggio di lettura completa si rifiuta su {build}: avviare la lettura completa sul firmware senza patch di questa build blocca la termocamera (legge da un valore che non è un indirizzo della flash; misurato sull’emulatore: forniti 32 KB, poi la termocamera è andata in errore). La modifica che rende sicura la lettura è a {sites}, e non è tra le modifiche che questa esecuzione ha registrato per {bank:acc}: esegui il passaggio della patch (e porta a termine la scrittura) prima della lettura completa.',
  'preserve.gate.drainFiles':
    'il passaggio {step} richiede {files} (il dump consegnato viene rielaborato con l’acquisizione di ogni slot scritto), che non si trova nella cartella dell’esecuzione',
  'preserve.gate.restoreNoCommit':
    'il passaggio {step} rimette gli slot originali al posto della patch, e questa esecuzione non ha una scrittura completata: non c’è nulla da annullare. Esegui prima la scrittura (o riprendi da lì), oppure salta esplicitamente (allowJump) per ripristinare una termocamera che ha già la patch.',
  'preserve.gate.restoreNeedsPatch':
    'il passaggio {step} richiede il riepilogo della patch di ogni slot scritto (per la lunghezza trasferita): esegui prima il passaggio della patch',
  'preserve.gate.restoreNoForm':
    'il passaggio di ripristino si rifiuta su {build}: nessuna forma del firmware originale supera il controllo della termocamera e allo stesso tempo viene conservata come i byte originali; la somma di controllo del firmware originale è 0xB7AB9D17 (misurato), non lo 0xFFFF che la termocamera richiede. Questa esecuzione termina con l’immagine completa in mano e la patch ancora presente; il contenuto originale può tornare solo con un programmatore della flash completa.',
  'preserve.gate.restoreFiles':
    'il passaggio {step} richiede {files} (l’originale di ogni slot scritto, dal passaggio di backup), che non si trova nella cartella dell’esecuzione',
  'preserve.gate.verifyNoRestore':
    'il passaggio {step} confronta un nuovo avvio con il backup, e questa esecuzione non ha un ripristino completato: uno slot con la patch risulterebbe come differenze. Esegui prima il ripristino (o riprendi da lì), oppure salta esplicitamente (allowJump) se il ripristino è andato a segno senza il suo punto di controllo.',
  'preserve.gate.verifyNeedsBackup':
    'il passaggio {step} richiede {file} (il riferimento del confronto), che non si trova nella cartella dell’esecuzione',
  'preserve.gate.needsBanks':
    'il passaggio {step} richiede gli slot letti dal passaggio di backup, e lo stato non ne ha',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'nessuno slot è scelto per questa esecuzione: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:acc} non può essere scritto: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'la patch di questa build si avvia solo dallo slot di recupero R: {note}; l’esecuzione scriverebbe {bank:loc}, dove il bootloader non la esegue mai',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'il file è troppo piccolo per contenere un’intestazione d’immagine',
  'slots.image.notWordSized':
    'la dimensione dell’immagine deve essere un multiplo di 4 (ricevuti {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'l’immagine è di {size} B; il bootloader rifiuta qualsiasi header.length >= {limit}, quindi non si avvierebbe mai',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'nessuna intestazione d’immagine a {at} (magic {magic}, previsto {expected}): deve essere un’immagine del firmware Seek decifrata, non uno slot cifrato o un dump della flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'lo stack pointer iniziale {address} non è nella SRAM dell’LPC43xx: non sembra decifrata',
  'slots.image.stackUnaligned': 'lo stack pointer iniziale {address} non è allineato a una parola',
  'slots.image.notThumb': 'il vettore di reset {address} non è un indirizzo Thumb',
  'slots.image.noKeyPair':
    'il nome di questo file non riporta la sua coppia di chiavi, e né la coppia di questa termocamera né una coppia di un’applicazione decodificata compare esattamente una volta nell’immagine, quindi non si può sapere per quali chiavi è stata costruita l’immagine. I file decifrati escono con un nome che indica le chiavi che contengono.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'il nome del file indica la chiave A {keyA} e la chiave B {keyB}, ma {mismatch}. Entrambe le chiavi devono essere presenti, ciascuna esattamente una volta.',
  'slots.image.keyInHeader':
    'questa immagine tiene una chiave a {at}, dentro la finestra dell’intestazione in chiaro: la patch viene rifiutata',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'la chiave A e la chiave B del nome del file corrispondono a byte sovrapposti a {at} e {other}: devono essere due valori distinti da 16 byte',
  'slots.image.retargetLost':
    'dopo il riadattamento, l’immagine non contiene esattamente una volta la coppia di chiavi di questa termocamera: rifiutata la creazione di dati per i cui aggiornamenti successivi il bootloader non avrebbe la chiave',
  'slots.image.noStageKey':
    'l’immagine non contiene alcuna coppia di chiavi della linea del 2016, quindi non c’è una chiave di trasferimento con cui codificarla',
  'slots.image.ffSumNoKeys':
    'questa immagine ha la somma delle parole FF a 16 Hz 0xFFFF ma non contiene la coppia di chiavi 1.3.0.8-FF (entrambe le metà, una volta ciascuna), quindi la sua forma trasferita non si può costruire. Non è stato scritto nulla.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'questa è l’immagine 1.3.0.8 FF (16 Hz), che si trasferisce nella sua forma con la chiave A (ff-form.ts), non come immagine in chiaro. Non è stato scritto nulla.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'il piano è stato costruito per il firmware {firmware}, ma l’analisi legge {version}. Il piano non è aggiornato; costruiscilo di nuovo. Non è stato scritto nulla.',
  'slots.plan.otherFirmwareUnknown':
    'il piano è stato costruito per un firmware di versione sconosciuta, ma l’analisi legge {version}. Il piano non è aggiornato; costruiscilo di nuovo. Non è stato scritto nulla.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'il piano è stato costruito per la termocamera {planSerial}, ma l’analisi legge {serial}. Scrittura rifiutata qui. Non è stato scritto nulla.',
  'slots.plan.cameraUnknownSerial': 'con numero di serie sconosciuto',
  'slots.plan.unknownSerial': 'un numero di serie sconosciuto',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'il piano punta a {address}, ma {name:acc} della build è a {at}',
  'slots.plan.notRead': 'l’analisi non legge più {name:acc}. Non è stato scritto nulla.',
  'slots.plan.edited':
    'la somma di controllo del piano non corrisponde ai suoi dati, quindi il piano è stato modificato. Non è stato scritto nulla.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'i dati sono {size} B, più grandi {name:gen}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Scriverlo richiede acknowledgeRisk: true. Non è stato inviato nulla.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'questa termocamera non può ricevere da qui un’immagine trasferita in chiaro: {reason}. Non è stato scritto nulla.',
  'slots.plan.noKeyTable':
    'l’analisi non indica la tabella delle chiavi del bootloader di questa termocamera, quindi l’immagine non può essere riadattata per essa',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'lo stato della conferma della scrittura non si è potuto leggere dopo CompleteMemoryUpgrade, quindi {name:acc} potrebbe essere scritto solo in parte. Leggi di nuovo gli slot prima di fare qualsiasi altra cosa, e conserva il tuo dump.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'la termocamera ha rifiutato la scrittura {name:loc} alla conferma, con {status}: {cause}. Non è stato scritto nulla; lo slot è invariato. Leggi di nuovo gli slot prima di fare qualsiasi altra cosa.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade ha restituito {status} ({cause}) per {name:acc}: non è stato programmato nulla, ma la cancellazione potrebbe essere iniziata, quindi lo slot potrebbe essere cancellato in parte. Leggi di nuovo gli slot prima di fare qualsiasi altra cosa, e conserva il tuo dump.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade ha restituito {status} ({cause}): {name:acc} potrebbe essere scritto solo in parte. Leggi di nuovo gli slot prima di fare qualsiasi altra cosa, e conserva il tuo dump.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'la termocamera ha comunicato {status} durante il trasferimento {name:dat} all’offset {offset}: interrotto prima di CompleteMemoryUpgrade, quindi nella flash non è stato scritto nulla',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum':
    'la somma di controllo del trasferimento non corrispondeva ai byte trasferiti',
  'commit.cause.unsupported':
    'l’immagine non si è decifrata con le chiavi della termocamera, oppure il tipo di dati è rifiutato',
  'commit.cause.acceptance':
    'l’immagine è stata rifiutata dal suo controllo di accettazione prima di cancellare qualsiasi cosa (il controllo dipende dalla build)',
  'commit.cause.notArmed': 'nessun aggiornamento di slot era stato aperto',
  'commit.cause.eraseFailed': 'la fase di cancellazione non è riuscita',
  'commit.cause.programFailed': 'la fase di programmazione non è riuscita',
  'commit.cause.verifyFailed': 'la fase di verifica non è riuscita',
  'commit.cause.unknown': 'uno stato non noto qui',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself':
    '{name:ins} non viene copiato su se stesso. Non è stato scritto nulla.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Non è stato scritto nulla.',
  'copy.refused.noPlain':
    '{name:ins} non ha un’immagine decifrata da copiare. Non è stato scritto nulla.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} è uno ZIP che qui non si può leggere ({error}). Non è stato scritto nulla.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} non contiene una flash completa. Uno ZIP viene accettato se è un file di esecuzione di Preserve che contiene {preserve} (dopo che è stato eseguito il suo passaggio di dump completo), uno zip di Estrai e decifra 4.x/Nano ({dump}) o uno zip di Estrai tutti i selettori ({selectors}); questo ZIP contiene {names}. Non è stato scritto nulla.',
  'restore.refused.noWholeFlashPatched':
    '{file} non contiene una flash completa. Uno ZIP viene accettato se è un file di esecuzione di Preserve che contiene {preserve} (dopo che è stato eseguito il suo passaggio di dump completo), uno zip di Estrai e decifra 4.x/Nano ({dump}) o uno zip di Estrai tutti i selettori ({selectors}); questo ZIP contiene {names}. Il suo {patched} è la flash con dentro la patch temporanea dell’esecuzione, quindi non viene accettato. Non è stato scritto nulla.',
  'restore.refused.zipEmpty': 'nulla',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'un backup completo della flash è di {full} B (4 MB, l’intero chip che legge un J-Link); {file} è di {size} B. Non è stato scritto nulla.',
  'restore.refused.noBank':
    'il piano di questa build non ha {bank:acc}. Non è stato scritto nulla.',
  'restore.refused.outsideFlash':
    '{name:ins} non è dentro una flash da 4 MB. Non è stato scritto nulla.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where}: il dump da cui proviene {file} non l’ha letto; secondo il suo manifest.json, {address} è un vuoto. Non c’è un’immagine da ripristinare. Non è stato scritto nulla.',
  'restore.refused.gapReason':
    '{where}: il dump da cui proviene {file} non l’ha letto; secondo il suo manifest.json, {address} è un vuoto ({gap}). Non c’è un’immagine da ripristinare. Non è stato scritto nulla.',
  'restore.refused.gapFill':
    '{where}: il dump da cui proviene {file} non l’ha letto; secondo il suo manifest.json, {address} è un vuoto, riempito con {fill}. Non c’è un’immagine da ripristinare. Non è stato scritto nulla.',
  'restore.refused.gapReasonFill':
    '{where}: il dump da cui proviene {file} non l’ha letto; secondo il suo manifest.json, {address} è un vuoto ({gap}), riempito con {fill}. Non c’è un’immagine da ripristinare. Non è stato scritto nulla.',
  'restore.refused.empty':
    '{where}: è vuoto, ogni byte è 0xFF. Una scrittura programma un’immagine e non può lasciare uno slot cancellato, quindi uno slot vuoto non può essere ripristinato con una scrittura. Non è stato scritto nulla.',
  'restore.refused.fill':
    '{where}: ogni byte è {fill}, il riempimento che il dump scrive dove non ha letto nulla: il dump non ha letto questo slot. Non c’è un’immagine da ripristinare. Non è stato scritto nulla.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where}: non si può ripristinare da questo file ({why}). Non è stato scritto nulla.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'questa build non ha un comando di apertura in scrittura per lo slot',
  'support.noStagingEmpty':
    'questa build non ha una forma di trasferimento, quindi uno slot vuoto non viene scritto',
  'support.buildUnknown': 'la build è sconosciuta',
  'support.unverifiedStaging':
    'questa build è sulla linea bloccata 0.x/1.x ma non è una delle build su cui sono state misurate le tabelle delle patch di Preserve (da 0.8.0.0 a 1.3.0.8 e 1.0.3.0 / 1.0.3.2), quindi la forma di trasferimento del suo slot è sconosciuta e non viene scritto nulla',
  'support.unknownFamily':
    'la famiglia della termocamera non è nota, quindi non lo è nemmeno la chiave con cui si scrivono i suoi slot, e una termocamera accetta uno slot scritto con la chiave sbagliata e poi non si avvia da esso. Estrai e decifra questa termocamera, identificala dal dump, poi indica la sua famiglia con --family.',
  'support.noReadCommand':
    'il firmware precedente a 0.8.0.0 non ha un gestore di lettura per GetFeaturedFirmwareData, il comando con cui un dump legge la flash. Su 0.7.0.7 e 0.7.0.8 è nella tabella dei metodi RPC a 0x4F ma registrato solo come setter (gestore di scrittura), quindi la lettura control-IN che invia un dump non può essere smistata (l’esecuzione di Preserve legge invece quelle due build tramite il wire id 0x58, GetFeaturedData); prima di 0.7.0.7 il wire id 0x4F è UploadFirmwareRowSize, e su 0.3.0.1 il wire id 0x52, quello con cui un dump apre la lettura, è EnterBootloaderMode invece di BeginFirmwareUpgrade: la termocamera resta nella sua applicazione, ma ogni apertura imposta una destinazione nella flash e apre la fase di aggiornamento del firmware di quella build (GetErrorCode poi legge 0x00400000), che non è una finestra di lettura. Ricavato dalle tabelle dei metodi delle immagini stesse, entrambe le colonne dei gestori; vedi test/firmware/facts.json.',
  'support.noWritePath':
    'queste build ricevono il nuovo firmware tramite una sequenza di aggiornamento più vecchia che questi strumenti non inviano, e i loro slot non sono mai stati mappati, quindi non viene scritto nulla.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'non è stato possibile leggere la versione del firmware, quindi la build, i suoi slot e la loro forma di trasferimento sono sconosciuti; su di essa non viene letto né scritto nulla',
  'support.versionNotDotted':
    'la versione del firmware «{version}» non è una versione a punti, quindi la build, i suoi slot e la loro forma di trasferimento sono sconosciuti; su di essa non viene letto né scritto nulla',
  'support.olderThanFirst':
    'il firmware {version} è precedente a {first}: la sua tabella RPC non ha un gestore di lettura per GetFeaturedFirmwareData, il comando che invia la lettura di uno slot, quindi non le viene inviata né una lettura né una scrittura (early-compact ha le prove)',
  'support.modernOnLocked':
    'la famiglia modern-4x copre 2.x, 4.x, 10.x, 42.x e 44.x; {version} è sulla linea bloccata 0.x / 1.x, che richiede legacy-auth o compact-2016',
  'support.lockedOnModern':
    'la famiglia legacy-auth copre la linea bloccata 0.x / 1.x; {version} è sulla linea moderna, che richiede modern-4x',
  'support.notCompactPro':
    'la famiglia compact-2016 copre la linea Compact PRO 1.0.3.x; {version} non è su di essa',
  'support.earlyCompact':
    'la famiglia early-compact copre solo le build precedenti a {first}, e {version} viene letta tramite legacy-auth',
  'support.generic':
    'la famiglia della termocamera non è identificata (famiglia generic), quindi la disposizione degli slot e la forma di trasferimento sono sconosciute; identifica la termocamera prima di leggere o scrivere uno slot',
  'support.noPlan':
    'non esiste un piano degli slot per la famiglia {family}: la disposizione dei suoi slot e la forma di trasferimento non sono note',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'la tabella di questa build non apre la modalità {mode} a {address} sul canale semplice',
  'support.noArmToken':
    'la tabella di questa build non apre la modalità {mode} a {address} sul canale con token',
  'support.windowElsewhere': 'la finestra di Preserve {bank:gen} è a {at}, non a {address}',
  'support.noDumpWindow':
    'la tabella BeginFirmwareUpgrade di questa build non ha una finestra a {address} per {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} non supporta {capability}: {reason}',
  'support.capability.dump': 'il dump',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': 'Estrai tutti i selettori',
  'support.capability.decrypt': 'la decifratura',
  'support.capability.deviceInfo': 'la lettura completa della scheda Info',
  'support.capability.flash': 'le scritture degli slot',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name:ins} all’indirizzo {address} non è leggibile su questa build: la sua tabella dei selettori non ha lì una finestra, quindi non è stato aperto nulla per esso',
  'slots.unread.missing': '{name:ins} manca dall’analisi della termocamera',
  'slots.unread.notRead': '{name:ins} non è stato letto',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Non è stato scritto nulla.',
  'slots.refused.versionUnknown':
    'l’analisi non dice quale firmware esegue la termocamera, e i comandi degli slot significano cose diverse su build diverse. Leggi di nuovo le informazioni del dispositivo.',
  'slots.refused.versionUnknownWrite':
    'l’analisi non dice quale firmware esegue la termocamera. Non è stato scritto nulla.',
  'slots.refused.emptyInput': 'i dati in ingresso sono vuoti',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name:ins} è vuoto e non può essere scritto su questa build: {reason}',
  'slots.refused.noRaw': '{name:ins} non può ricevere byte grezzi su questa build: {reason}',
  'slots.refused.noPlain':
    '{name:ins} non può ricevere un’immagine decifrata su questa build: {reason}',
  'slots.refused.noStaging':
    '{name:ins} non ha una forma di trasferimento su questa build, quindi non si può codificare un’immagine per esso',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B sono più lunghi {name:gen} ({bankSize} B)',
  'slots.refused.imageTooLong': 'l’immagine è di {size} B, più lunga {name:gen} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'il bootloader del 2014 non accetta la somma di controllo di questa build nello slot A o B, e avvia lo slot di recupero R (0x14070000) senza controllarlo, quindi la patch viene scritta nello slot di recupero R e da nessun’altra parte',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'questa build funziona solo dallo slot di recupero R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'uno slot del firmware è di {size} B ({kib} KB); questo file è di {count} B',
  'decryptFile.erasedBank':
    'vuoto, niente da decifrare: tutti i {size} B si leggono come 0xFF (uno slot cancellato)',
  'decryptFile.erasedHeader':
    'cancellato: la finestra dell’intestazione è tutta 0xFF, quindi lo slot non contiene un’immagine; non viene decifrato nulla',
  'decryptFile.noHeader':
    'nessuna intestazione d’immagine (magic {magic}), quindi non c’è un’immagine da decifrare',
  'decryptFile.lengthOutOfRange':
    'header.length {length} è fuori intervallo; nessuna immagine da decifrare',
  'decryptFile.ffKeyB':
    'decifrati {size} B con la chiave B della FF 1.3.0.8: l’immagine è conservata come l’immagine in XOR con il flusso di chiave del suo blocco di chiavi 1, finestra dell’intestazione invariata',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'chiave non ricavata: l’immagine si decifra in un vettore di reset che non è un punto d’ingresso Cortex-M (chiave {check}); non viene decifrato nulla',
  'decryptFile.storedPlain':
    'conservata in chiaro: lo slot contiene l’immagine così come viene eseguita (la catena in chiaro del 2014, un flusso di chiave identità), quindi non c’è una chiave e l’immagine decifrata è l’immagine stessa',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'decifrati {size} B con la chiave ricavata da questo slot ({check})',
  'decryptFile.decryptedNamed':
    'decifrati {size} B con la chiave ricavata da questo slot ({check}; è {key:acc})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'lettura corta ({size} B)',
  'read.reason.noParse': 'impossibile analizzare un’intestazione d’immagine',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'nessuna intestazione d’immagine (magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} è fuori intervallo',
  'read.reason.stopped': 'lettura dello slot interrotta a {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'non leggibile sul firmware {version}: il suo piano ({table}) non ha una finestra a {address}, quindi non è stato aperto nulla per esso',
  'read.reason.notInPlanUnknown':
    'non leggibile su un firmware di versione sconosciuta: il suo piano ({table}) non ha una finestra a {address}, quindi non è stato aperto nulla per esso',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'la finestra ha fornito i byte di un descrittore di lettore non aggiornato (la parola 0 {word} con reset {hex} è la tabella dei vettori di 0x14000000, non il contenuto di questo slot), quindi non è stato analizzato nulla: {remedy}',
  'read.reason.spentReader': 'non è stato possibile leggere gli slot della termocamera: {remedy}',
  'read.spentRemedy':
    'il lettore di finestre potrebbe essere esaurito per questo avvio; spegni e riaccendi la termocamera e riprova',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'non è stato possibile leggere la parola dello slot attivo della termocamera (fw info roots, selettore 10)',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'la parola dello slot attivo della termocamera è {word}, che non indica alcuno slot',
  'checkKey.unnamed.cfg0NotRead':
    'la parola di configurazione di avvio non è stata letta, quindi non si sa se il bootloader abbia controllato {bank:acc} prima di entrarci',
  'checkKey.unnamed.noZeroSum':
    'la termocamera comunica di essere entrata {bank:loc}, ma {bank:acc} non si decifra in una somma delle parole pari a zero in questa lettura',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'la termocamera comunica di essere entrata {bank:loc}, che la parola di configurazione di avvio {word} lascia per ultimo, quindi il bootloader ci è entrato senza il suo controllo, ma {bank:acc} non si decifra in una somma delle parole pari a zero in questa lettura',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (punteggio {score} dopo la lettura, in base agli indizi qui sotto)',
  'report.detectedAmbiguous':
    '{family} (punteggio {score} dopo la lettura, in base agli indizi qui sotto; ambiguo)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'sì',
  'report.cell.no': 'no',
  'report.cell.notApplicable': 'n/d',
  'report.cell.unknown': 'sconosciuto',
  'report.cell.recoveryOnly': 'solo recupero',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'K di whitening',
  'report.keyRow.store': 'chiave di archiviazione',
  'report.keyRow.check': 'chiave di verifica',
  'report.keyRow.table': 'tabella delle chiavi',
  'report.keyRow.keys': 'chiavi',
  'report.keyRow.a': 'chiave A',
  'report.keyRow.b': 'chiave B',
  'report.keyRow.tableAt': 'tabella a',
  'report.key.notIdentified': '(non identificata)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} candidata, nessuna confermata',
    many: '{count} di candidate, nessuna confermata',
    other: '{count} candidate, nessuna confermata',
  },
  'report.key.tableAt': '{offset} nel blocco del bootloader, confermata con uno slot',
  'report.key.plainChain':
    'nessuna necessaria: gli slot sono conservati come firmware in chiaro, quindi uno slot si legge e si scrive così com’è',
  'report.key.tableRefused2016':
    'non letta: su questa linea il blocco del bootloader (0x14000000) viene rifiutato su ogni canale',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, indicata in base {bank:dat}, lo slot in cui la termocamera comunica di essere entrata dopo il controllo del bootloader',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, dedotta in base {bank:dat}, lo slot in cui la termocamera comunica di essere entrata: il bootloader entra in quello slot senza il suo controllo, e lo esegue con la chiave con cui controlla gli altri slot',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (blocco 1 della {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'coppia Compact PRO 1.0.3.x a 9 Hz',
  'keyPair.cp1032ff': 'coppia Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'non indicata — {why}',
  'report.checkKey.couldNotName': 'la lettura non ha potuto indicarla',
  'report.storeKey.checkKeyUnnamed':
    'la chiave con cui il bootloader controlla uno slot (non indicata in questa lettura): l’applicazione conserva con quella chiave ogni slot che scrive',
  'report.storeKey.checkKey':
    '{key}: l’applicazione conserva ogni slot che scrive con la chiave che controlla il suo bootloader',
  'report.storeKey.unknown':
    'sconosciuta: il blocco del bootloader che contiene lo spazio della chiave propria del dispositivo non è stato letto',
  'report.storeKey.keyBUnidentified':
    'Chiave B (nessuna chiave propria del dispositivo programmata; la chiave B stessa non è identificata)',
  'report.storeKey.keyB': 'Chiave B (nessuna chiave propria del dispositivo programmata)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'trasferito in chiaro (l’immagine così com’è, senza chiave)',
  'report.staged.slotKeystream': 'trasferito con il blocco di chiavi 0 della sua stessa immagine',
  'report.staged.keyA':
    'trasferito con chiavi ricavate dallo slot avviato e dall’applicazione in esecuzione',
  'report.staged.ffVendor':
    'trasferito come l’app del produttore trasferisce l’immagine FF a 16 Hz (l’immagine in XOR con il suo blocco di chiavi 0), e conservato dalla termocamera con la chiave B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Backup: blocco {address}',
  'progress.backupDone': 'Backup: ogni blocco letto',
  'progress.checkBlock': 'Verifica: blocco {address}',
  'progress.checkDone': 'Verifica: ogni blocco letto',
  'progress.writingBank': 'Scrittura {bank:gen}',
  'progress.restoringBank': 'Ripristino {bank:gen}',
  'progress.staged': '{label}: trasferiti {done}/{total} B',
  'progress.wholeFlash': 'Lettura completa: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'lettura {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'lettura {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Fatto: {ok}/{total} finestre lette.',
  'progress.readingBank': 'Lettura {bank:gen} ...',
  'progress.analysing': 'Analisi in corso ...',
  'progress.probeSelector': 'prova del selettore {selector} ...',
  'progress.selectorsArmed': 'Fatto: {armed}/{span} selettori aperti, {withData} con dati.',
  'progress.recoveringKey': 'decifratura: recupero della chiave per {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank:ins} {address} (subcmd {subcmd}) non si è potuto leggere: {error}',
  'slots.read.refusedBuild':
    'rifiuto di leggere gli slot del firmware: {reason}. Non è stato inviato nulla oltre alla lettura della versione, quindi nessuno slot è stato toccato.',
  'slots.backup.notSaved':
    'il backup {file} non è stato salvato, quindi non è stato scritto nulla. Una scrittura non parte mai senza aver prima salvato il suo backup; riprova quando si potrà salvare.',
  'slots.backup.notSavedWhy':
    'il backup {file} non è stato salvato ({error}), quindi non è stato scritto nulla. Una scrittura non parte mai senza aver prima salvato il suo backup; riprova quando si potrà salvare.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'alta (480 Mbit/s)',
  'usb.speed.full': 'piena (12 Mbit/s)',
  'usb.speed.code': 'codice {code}',
} satisfies Translation<'core', 'it'>;
