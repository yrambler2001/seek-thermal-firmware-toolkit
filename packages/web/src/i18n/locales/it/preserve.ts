/**
 * Namespace `preserve`, italiano (it), translated from the English source: the "Dump & decrypt 0.x/1.x 2014/2016" tab, a guided run that
 * backs up the camera, writes a temporary patch so the whole flash can be read, then puts the original
 * firmware back and checks it.
 *
 * Owner: phase 2, preserve agent.
 * Covers: views/PreserveView.tsx, hooks/usePreservePanel.ts, lib/preserve/* (gating.ts, types.ts).
 *
 * Words used all over this tab:
 * - run = one pass of the wizard on one camera, from the backup to the check. Run file = the zip the
 *   browser downloads after every step; it is the run's only record and lets a run continue later.
 * - Step 01 is Connect (shared with the other tabs); the phases are steps 02, 03 and 04. "Step 02"…
 *   keep the two-digit numbers.
 * - bank = one of the camera's three firmware slots, A, B and R (R = recovery). {bank}, {a}, {b}, {r}
 *   and {banks} are names from common:bank.*: "Slot A" / "Recovery R" on their own, "slot A" /
 *   "recovery R" inside a sentence. {banks} is a list of those names ("slot A, slot B and recovery R").
 * - the write = the patch written into the chosen banks (step 03); the restore = the original firmware
 *   written back (step 04); the whole-flash read = reading the full 4 MiB flash once the patch runs.
 * - "Connect device" is the page's connect button (app:connect.connect): use the same words.
 * - The step names on the chips (Backup, Patch, Write, Whole-flash read, Restore, Check) are core's
 *   words, translated in core:preserve.step.*. The sentences core writes ({why}, {reason}, {what},
 *   {build}…) arrive already translated, from the `core` namespace.
 * - SPI, SWD/J-Link, MiB/KiB, sha256, hex values and file names stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': 'Cosa aspettarsi',
  'how.descriptionIdle': 'Collega la termocamera, poi inizia dal passaggio 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Esecuzione {runId}.',
  'how.descriptionRunVersion': 'Esecuzione {runId} — firmware {version}.',
  'how.restarts':
    'La termocamera si **riavvia** durante ogni passaggio. Dopo un riavvio Chrome non la riconosce più (non ha un numero di serie USB), quindi la pagina ti chiede di premere **Collega dispositivo** e di selezionare di nuovo la termocamera. È il flusso normale: poi il passaggio continua da solo.',
  'how.noFile':
    'Non c’è nessun file del firmware da scegliere: tutto viene letto dalla termocamera stessa.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'La termocamera conserva il firmware in tre **slot** ({a}, {b} e {r}). Il passaggio 02 li legge tutti e tre e capisce da quale si avvierà la prossima volta; la patch funziona solo se si trova in quello slot. Scegli tu gli slot a cui il passaggio 03 applica la patch (per impostazione predefinita quello in cui entra il prossimo avvio), e il passaggio 04 li rimette tutti com’erano.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Dopo ogni passaggio il browser scarica un **file di esecuzione** con un nome che indica l’inizio dell’esecuzione, l’ora del salvataggio e il passaggio raggiunto (`{example}`), con una cartella per ogni passaggio. Conserva il più recente: ti permette di continuare in seguito.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**I passaggi 03 e 04 scrivono nella memoria flash della termocamera**, e ognuno ti chiede prima conferma. Mentre uno dei due è in corso, tieni la termocamera collegata (a meno che la pagina non ti chieda di ricollegarla) e il computer acceso e attivo, meglio se collegato alla corrente. Una scrittura interrotta lascia una termocamera che solo un programmatore hardware (SPI o SWD/J-Link) può riparare.',
  'how.phone':
    '**Su un telefono:** prima del passaggio 03 attiva la modalità aereo e disattiva Wi-Fi e dati mobili, così una chiamata o una notifica non può portare via il browser durante la scrittura, e tieni lo schermo acceso. Una volta aperta, la pagina continua a funzionare offline.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**La scrittura non risulta registrata per questa esecuzione, quindi i passaggi successivi sono bloccati.** La termocamera potrebbe già eseguire l’immagine con la patch (una scrittura interrotta) oppure no (la scrittura non è mai partita): il file di esecuzione non può dimostrare quale dei due. Non eseguire la lettura completa della flash né il ripristino su una termocamera con la patch senza la scrittura registrata; la strada giusta è il passaggio 03, il cui controllo prima della scrittura legge lo slot e si rifiuta di riscriverlo alla cieca. Il salto vale solo se quel controllo ha già rifiutato con *already holds the patched bytes*, e passa da una sua finestra di conferma.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Lettura e preparazione',
  'phase.readBuild.inSentence': 'lettura e preparazione',
  'phase.readBuild.description':
    'Legge tutto ciò che una termocamera originale lascia uscire (31 blocchi da 64 KB) e lo conserva come backup, legge una seconda volta ogni slot del firmware, capisce da quale slot si avvierà la termocamera la prossima volta e prepara la piccola patch che scrive il passaggio successivo. Nella termocamera non viene scritto nulla. Di solito dura meno di un minuto. Se nel frattempo la termocamera deve riavviarsi, la pagina ti chiede di premere «Collega dispositivo» e di selezionarla di nuovo: è previsto.',
  'phase.patchDump.label': 'Scrittura e lettura completa',
  'phase.patchDump.inSentence': 'scrittura e lettura completa',
  'phase.patchDump.description':
    'Scrive una piccola patch temporanea negli slot del firmware scelti nel passaggio 02 (per impostazione predefinita lo slot da cui la termocamera si avvierà la prossima volta), perché possa leggere tutta la sua memoria flash. Poi la termocamera si riavvia (premi «Collega dispositivo» e selezionala di nuovo quando la pagina te lo chiede) e viene letta l’intera flash da 4 MB. Il passaggio 04 rimette il firmware originale.',
  'phase.restoreVerify.label': 'Ripristino e verifica',
  'phase.restoreVerify.inSentence': 'ripristino e verifica',
  'phase.restoreVerify.description':
    'Riscrive il firmware originale, riavvia la termocamera (premi «Collega dispositivo» e selezionala di nuovo quando ti viene chiesto), poi rilegge tutto ancora una volta per controllare che corrisponda al backup byte per byte.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Legge i 31 blocchi da 64 KB che una termocamera originale può leggere, poi legge ogni slot una seconda volta (le due letture devono coincidere byte per byte), ricava il firmware di ogni slot da ciò che la termocamera conserva (decifrandolo dove è conservato cifrato) e lo controlla, e capisce da quale slot si avvierà la termocamera. È l’unica copia di questa termocamera fatta dall’esecuzione, presa prima di scrivere qualsiasi cosa.',
  'step.patch.description':
    'Offline, senza termocamera. Prepara la patch per ogni slot che l’esecuzione può scrivere: permette alla lettura della termocamera di raggiungere l’intera flash da 4 MB, e viene scritta nella forma in cui la termocamera la conserva, così cambiano solo i byte della patch stessa.',
  'step.commit.description':
    'La scrittura. Prima rilegge ogni slot scelto e non scrive nulla se ognuno non contiene ancora ciò che il backup ha registrato (una scrittura già andata a segno non viene mai ripetuta), poi scrive ciascuno, per ultimo lo slot che la termocamera prova per primo. Qui la termocamera non viene riavviata: la riavvia il passaggio successivo.',
  'step.drain.description':
    'Riavvia la termocamera perché esegua il firmware con la patch (resta muta per una decina di secondi; la pagina aspetta e la ritrova), controlla da quale slot si è avviata (uno slot senza la patch ferma il passaggio prima di leggere qualsiasi cosa), poi legge l’intera flash da 4 MB in una sola lettura e inserisce nell’immagine salvata il firmware originale di ogni slot scritto, preso dal backup. Non viene scritto nulla.',
  'step.restore.description':
    'L’altra scrittura. Riscrive il firmware originale di ogni slot scritto mentre il firmware con la patch è ancora in esecuzione, poi riavvia la termocamera.',
  'step.verify.description':
    'Dopo un nuovo avvio, rilegge i 31 blocchi, tra cui ogni slot: 0 byte diversi dimostra che la flash della termocamera è identica byte per byte al backup. Sola lettura.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Avvia {phase}',
  'phase.retry': 'Riprova {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Vai al passaggio 04: ripristina gli slot',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Prosegui oltre la scrittura non registrata',
  'phase.skipWrite': 'Salta la scrittura: inizia dalla lettura completa',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Azioni: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'scrive nella termocamera',
  'badge.running': 'In corso',
  'badge.done': 'Fatto',
  'badge.plannedStop': 'Fermato come previsto: ora il ripristino',
  'badge.failed': 'Fermato: vedi il registro',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Prossimo',
  /* Why the start button is off. */
  'notReady.noRun': 'Disponibile dopo il passaggio 02, che avvia l’esecuzione.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Disponibile dopo il passaggio {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Non ancora pronto: {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Riguarda la termocamera con la patch mentre la scrittura non è registrata: la termocamera potrebbe avere già la patch. Vedi la nota sotto «{section}».',
  'phase.noDrain':
    'La lettura completa della flash non è stata eseguita: questo passaggio rimette a posto la termocamera senza di essa. Esegui prima il passaggio 03, a meno che la lettura completa non ti interessi.',
  'phase.keepPlugged':
    'Tieni la termocamera collegata e il computer attivo finché questo passaggio non termina.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Avanzamento',
  'phase.showDetails': 'Mostra i dettagli nel registro',
  'phase.inDetail': 'Cosa fa questo passaggio, nel dettaglio',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Tocca a te',
  'yourTurn.reconnect.title': 'Tocca a te: premi Collega dispositivo e seleziona la termocamera.',
  'yourTurn.reconnect.body':
    'La termocamera si è riavviata, come previsto. Chrome non riesce a riconoscerla di nuovo da solo (non ha un numero di serie USB), quindi devi selezionarla ancora una volta. Il passaggio continua appena lo fai.',
  'yourTurn.replug.title':
    'Tocca a te: scollega la termocamera, ricollegala, poi premi Collega dispositivo.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'La patch di questa esecuzione è stata creata prima della correzione del lettore, quindi la termocamera ha bisogno di una nuova accensione prima del ripristino. Il file di esecuzione è già salvato.',
  'yourTurn.replugBeforeRestore.title':
    'Prima del passaggio 04: scollega la termocamera, ricollegala, poi premi Collega dispositivo.',
  'yourTurn.powerCycle.title':
    'Tocca a te: scollega la termocamera, ricollegala, premi Collega dispositivo, poi riprova.',
  'yourTurn.powerCycle.body':
    'Il lettore della termocamera ha bisogno di una nuova accensione prima di poterla leggere di nuovo. L’esecuzione è ancora caricata qui; non si perde nulla.',
  'yourTurn.powerCycleAssert.title':
    'Tocca a te: scollega la termocamera, ricollegala, premi Collega dispositivo, poi continua.',
  'yourTurn.powerCycleAssert.body':
    'L’ultimo tentativo di backup si è fermato, e la termocamera ha bisogno di una nuova accensione prima di ripartire. La termocamera non può comunicarlo da sola, quindi con il pulsante qui sotto dici alla pagina che l’hai fatto.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'L’ho ricollegata: continua {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'A quali slot il passaggio 03 applica la patch',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Parola di config. di avvio',
  'banks.lastStart': 'Ultimo avvio',
  'banks.nextStart': 'Prossimo avvio',
  'banks.caption': 'I tre slot del firmware, come li ha letti il passaggio 02',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Indirizzo',
  'banks.col.holds': 'Cosa contiene',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'prossimo avvio',
  'banks.choiceLabel': 'Slot a cui applicare la patch',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Lo slot in cui entra il prossimo avvio',
  'choice.all': 'Tutti gli slot',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — non disponibile',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Nessuno slot ancora scelto: {what}. Scegli uno slot per nome qui sopra.',
  'banks.writes': 'Il passaggio 03 scrive {what}.',
  'banks.fixed':
    'La scrittura è stata eseguita, quindi la scelta è fissata: il passaggio 04 rimette esattamente questi slot.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: non disponibile — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nessuna esecuzione attiva: il passaggio 02 ne avvia una',
  'banks.refusedBusy': 'è in corso un passaggio: scegli gli slot quando sarà terminato',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Il piano — {build}, patch {banks:dat}',
  'plan.summaryNone': 'Il piano — {build}, nessuno slot ancora scelto',
  'plan.yourCamera': 'la tua termocamera',
  'plan.intro':
    'Ricavato dai byte della termocamera stessa. Non viene scritto nulla finché non si esegue il passaggio 03, e il passaggio 04 rimette com’era ogni byte che scrive.',
  /* The rows; their values are core's. */
  'plan.build': 'Build',
  'plan.version': 'Versione del firmware',
  'plan.written': 'Scritto',
  'plan.route': 'Dove va',
  'plan.restore': 'Ripristino',
  'plan.wholeFlash': 'Lettura completa della flash',
  'plan.outro':
    'Nella forma in cui la termocamera li conserva cambiano gli stessi byte e nessun altro, quindi il firmware della termocamera cambia esattamente di questa differenza e di nient’altro.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'La patch {bank:gen}',
  'bankPlan.titleChosen': '{bank} — scritto da questa esecuzione',
  'bankPlan.titleNotChosen': '{bank} — non scelto',
  'bankPlan.source': 'Origine dell’immagine',
  'bankPlan.sourceValue': '{bank}, così come è conservato',
  'bankPlan.sourceTwoReads':
    '{bank}, così come è conservato, due letture concordanti (sha256 {sha})',
  'bankPlan.edit': 'Modifica dell’immagine',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) sull’immagine di fabbrica. Il suo bilanciamento, {balance}, è nella parola di regolazione; la patch si bilancia sopra di esso, e il passaggio 04 rimette l’immagine con la modifica.',
  'bankPlan.factorySha': 'sha256 in chiaro di fabbrica',
  'bankPlan.patchedSha': 'sha256 con la patch',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Byte cambiati sul chip flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Lunghezza trasferita',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B in {count} blocco',
    many: '{size} B in {count} di blocchi',
    other: '{size} B in {count} blocchi',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Parola di bilanciamento',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (era {balance}, il bilanciamento della modifica)',
  'bankPlan.caption': 'I byte esatti che la patch modifica {bank:loc}',
  'bankPlan.col.what': 'Cosa cambia',
  'bankPlan.col.offset': 'Offset',
  'bankPlan.col.before': 'Prima',
  'bankPlan.col.after': 'Dopo',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Verificato: corrispondenza perfetta.** Dopo un nuovo avvio la termocamera è stata riletta: {read}/31 blocchi, {count} byte diverso. La sua flash è esattamente com’era prima della prima scrittura.',
    many: '**Verificato: corrispondenza perfetta.** Dopo un nuovo avvio la termocamera è stata riletta: {read}/31 blocchi, {count} di byte diversi. La sua flash è esattamente com’era prima della prima scrittura.',
    other:
      '**Verificato: corrispondenza perfetta.** Dopo un nuovo avvio la termocamera è stata riletta: {read}/31 blocchi, {count} byte diversi. La sua flash è esattamente com’era prima della prima scrittura.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Verificato: corrispondenza perfetta.** Dopo un nuovo avvio la termocamera è stata riletta: {read}/31 blocchi, {count} byte diverso (blocchi corti: {blocks}). La sua flash è esattamente com’era prima della prima scrittura.',
    many: '**Verificato: corrispondenza perfetta.** Dopo un nuovo avvio la termocamera è stata riletta: {read}/31 blocchi, {count} di byte diversi (blocchi corti: {blocks}). La sua flash è esattamente com’era prima della prima scrittura.',
    other:
      '**Verificato: corrispondenza perfetta.** Dopo un nuovo avvio la termocamera è stata riletta: {read}/31 blocchi, {count} byte diversi (blocchi corti: {blocks}). La sua flash è esattamente com’era prima della prima scrittura.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Il controllo ha trovato differenze rispetto al backup.** {error}',
  unknownReason: 'motivo sconosciuto',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase}: scrivere {banks:acc}?',
  'confirm.titleJump': '{phase}: saltare la scrittura non registrata?',
  'confirm.chosenBanks': 'gli slot scelti',
  'confirm.jump':
    'LA SCRITTURA NON RISULTA REGISTRATA per questa esecuzione, e stai affermando che le scritture sono andate a segno senza i loro punti di controllo: il passaggio inizia dopo la scrittura invece di scrivere di nuovo. I controlli del passaggio vengono comunque eseguiti (la lettura della versione, i controlli degli slot), e un’ipotesi sbagliata costa una lettura completa sprecata, non una termocamera bloccata.',
  'confirm.jumpKeepPlugged':
    'Tieni la termocamera collegata e il computer attivo finché il passaggio non termina.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Questa operazione scrive una piccola patch {banks:loc}. Il passaggio 04 rimette gli originali. La lettura completa che segue si limita a leggere.',
  'confirm.patchInOrder':
    'Questa operazione scrive una piccola patch {banks:loc}, in quest’ordine: lo slot che la termocamera prova per primo va per ultimo. Il passaggio 04 rimette gli originali. La lettura completa che segue si limita a leggere.',
  /* Step 04. */
  'confirm.restore': 'Questa operazione riscrive il firmware originale {banks:loc}.',
  'confirm.restoreInOrder':
    'Questa operazione riscrive il firmware originale {banks:loc}, in quest’ordine: lo slot che la termocamera prova per primo va per primo.',
  'confirm.keepPlugged':
    'Tieni la termocamera collegata e il computer attivo durante la scrittura: una scrittura interrotta lascia una termocamera che solo un programmatore hardware (SPI o SWD/J-Link) può riparare. Su un telefono, modalità aereo attiva e schermo sempre acceso. Poi la termocamera si riavvia; quando la pagina te lo chiede, premi Collega dispositivo e selezionala di nuovo. È previsto.',
  'confirm.yesJump': 'Sì, salta la scrittura',
  'confirm.yesWrite': 'Sì, scrivi nella termocamera',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'La prova',
  'summary.complete': 'Immagine completa (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'non prodotta',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'differisce dal backup in {differing} blocco su {count}: {blocks}',
    many: 'differisce dal backup in {differing} blocchi su {count}: {blocks}',
    other: 'differisce dal backup in {differing} blocchi su {count}: {blocks}',
  },
  'summary.matches': {
    one: 'corrisponde al backup nel suo {count} blocco',
    many: 'corrisponde al backup in tutti i {count} di blocchi',
    other: 'corrisponde al backup in tutti i {count} blocchi',
  },
  'summary.onlyInFull': 'Solo nella lettura completa',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blocco che una lettura normale non raggiunge: {blocks}',
    many: '{count} di blocchi che una lettura normale non raggiunge: {blocks}',
    other: '{count} blocchi che una lettura normale non raggiunge: {blocks}',
  },
  'summary.rawDump': 'Lettura completa, così come letta',
  'summary.rawDumpBadge': 'la stessa, con la patch ancora presente',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Immagine del firmware (decifrata, {bank})',
  'summary.verify': 'Verifica',
  'summary.toolbar': 'Azioni sull’archivio',
  'summary.download': 'Scarica l’archivio completo (file di esecuzione)',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Facoltativo: per continuare un’esecuzione in seguito',
  'runFile.title': 'File di esecuzione',
  'runFile.description':
    'L’unica traccia dell’esecuzione. Viene scaricato da solo dopo ogni passaggio (e dopo un passaggio che si è fermato prima); conserva il più recente. Per continuare in seguito, o dopo un problema, caricalo qui e la pagina riprende da dove si era fermata.',
  'runFile.run': 'Esecuzione',
  'runFile.file': 'File',
  'runFile.lastSaved': 'Ultimo salvataggio',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'dopo {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Passaggio successivo',
  'runFile.none':
    'Nessuna esecuzione attiva. Il passaggio 02 ne avvia una, oppure carica qui un file di esecuzione.',
  'runFile.toolbar': 'Azioni sul file di esecuzione',
  'runFile.load': 'Carica un file di esecuzione…',
  'runFile.save': 'Salva di nuovo il file di esecuzione',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Ripresa',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nessun file di esecuzione scelto.',
  'status.notRun': 'Non ancora eseguito.',
  'status.running': 'In corso …',
  'status.runningRestarts': 'In corso: la termocamera si riavvia durante questo passaggio …',
  'status.restarting': 'La termocamera si sta riavviando: ci vogliono circa dieci secondi …',
  'status.waitConnect': 'Tocca a te: premi «Collega dispositivo» e seleziona la termocamera …',
  'status.waitPlugBack': 'Tocca a te: ricollega la termocamera, poi premi «Collega dispositivo» …',
  'status.waitReplug': 'Tocca a te: scollega la termocamera e ricollegala …',
  'status.back': 'La termocamera è tornata: si continua …',
  'status.swapped': 'Fermato: la termocamera è cambiata. Controllala, poi esegui di nuovo la fase.',
  'status.noRun': 'Nessuna esecuzione.',
  'status.notCreated': 'Non creata: vedi il registro qui sopra.',
  'status.refused': 'Rifiutato: l’elenco delle fasi qui sopra dice cosa manca.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase}: fatto. Il file di esecuzione nei tuoi download è aggiornato.',
  'status.doneReplug':
    '{phase}: fatto, e il file di esecuzione è salvato. Prima del ripristino: scollega la termocamera, ricollegala e premi «Collega dispositivo».',
  'status.backupRefused': 'Rifiutato: non è stato scritto nulla. Vedi il registro qui sopra.',
  'status.failed': 'Non riuscito: vedi il registro qui sopra.',
  'status.cancelled':
    'Annullato: il file di esecuzione indica ancora dove si è fermata l’esecuzione.',
  'status.readingFile': 'Lettura del file di esecuzione …',
  'status.doneEarlier': 'Fatto in precedenza: caricato dal file di esecuzione.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Non riuscito in precedenza: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Ripreso da {step}. L’elenco delle fasi continua da lì.',
  'status.notResumed': 'Non ripreso: vedi il registro qui sopra.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'serve {missing}',
  'gate.noRun': 'nessuna esecuzione attiva: la prima fase crea l’esecuzione',
  'gate.runDone': 'questa esecuzione è terminata: ogni fase è completata',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'già fatto: la ripresa continua da {step}',
  'gate.banksRead': 'gli slot che legge il backup',
  'gate.choice': 'una scelta di slot — {why}',
  'gate.bankRefused': '{bank:acc} non può essere scritto: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'il percorso dello slot di recupero (questa build funziona solo {r:loc}, non {bank:loc})',
  'gate.backupFirst': 'il backup della flash (viene eseguito per primo in questa fase)',
  'gate.backup': 'il backup della flash',
  'gate.patchStep': 'il passaggio della patch',
  'gate.patchOf': 'la patch {bank:gen}',
  'gate.backupFile': 'il file delle finestre del backup',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'l’acquisizione {bank:gen}',
  'gate.derived': 'l’immagine ricavata {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'il passaggio Scrittura (prima eseguilo o riprendi da lì)',
  'gate.drainRefused': 'la lettura completa si rifiuta su {build} — {why}',
  'gate.patchSummary': 'il riepilogo della patch {bank:gen} (la lunghezza trasferita)',
  'gate.restoreRefused':
    'il ripristino si rifiuta su {build}: nessuna forma del firmware originale viene conservata di nuovo come i byte originali; l’esecuzione termina con l’immagine completa e la patch ancora presente',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'il testo in chiaro di fabbrica {bank:gen} ({file}, dal passaggio di backup)',
  'gate.restoreFirst': 'il ripristino (viene eseguito per primo in questa fase)',
  'gate.powerCycle':
    'la conferma dello spegnimento e riaccensione: spegni e riaccendi la termocamera (scollegala e ricollegala, o usa il suo interruttore), poi usa il comando per eseguire di nuovo',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'la termocamera non è tornata dopo {minutes} min di tentativi: {error}. Se Chrome non ha chiesto nulla, ricollega la termocamera ed esegui di nuovo la fase; se il registro diceva di ricollegarla, è il clic su «Collega dispositivo» che stava aspettando',
} satisfies Translation<'preserve'>;
