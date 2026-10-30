/**
 * Namespace `core`, português europeu (pt), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'a câmara fica desbloqueada até ser desligada e voltar a ser ligada, e até lá outras ferramentas podem lê-la mal; desligue-a e volte a ligá-la antes de as usar',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} primeiro, depois {second}, depois {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'não foi lida',
  'boot.verdict.checkKeyUnnamed':
    'não pôde ser verificada: a chave com que o bootloader verifica uma ranhura não foi identificada',
  'boot.cfg0NotRead':
    'a palavra de configuração de arranque (cfg[0]) não foi lida, por isso não se sabe que ranhura vai arrancar da próxima vez',
  'boot.select.unknown':
    'a palavra de configuração de arranque é {word}, por isso o bootloader experimenta primeiro {first:acc}, mas {bank:acc} {verdict}, por isso não se sabe que ranhura arranca',
  'boot.select.first':
    'a palavra de configuração de arranque é {word}, por isso o bootloader experimenta primeiro {first:acc}, e esta contém uma imagem que o bootloader aceita',
  'boot.select.second':
    'a palavra de configuração de arranque é {word}, por isso o bootloader experimenta primeiro {first:acc}; {first:acc} não contém nenhuma imagem que o bootloader aceite, por isso escolhe {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'a palavra de configuração de arranque é {word}, por isso o bootloader experimenta primeiro {first:acc}; nem {first:acc} nem {second:acc} contêm uma imagem que o bootloader aceite, por isso arranca a partir {last:gen}, que não verifica',
  'boot.select.lastTakes':
    'a palavra de configuração de arranque é {word}, por isso o bootloader experimenta primeiro {first:acc}; nem {first:acc} nem {second:acc} contêm uma imagem que o bootloader aceite, por isso escolhe {last:acc}, que não verifica',
  'boot.bootsNow': '{bank:ins} é a ranhura a partir da qual a câmara arranca agora',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'arranque atual',
  'boot.notBooted': 'não é a de arranque',
  'boot.unknownWhy.checkKeyUnnamed':
    'a chave com que o bootloader verifica uma ranhura não foi identificada nesta leitura',
  'boot.unknownWhy.noKeyTable':
    'a tabela de chaves do bootloader não foi lida, por isso não é possível identificar as chaves que ele experimenta',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'A câmara arranca a partir {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: contém um patch da taxa de fotogramas, mas não arranca, por isso o patch não tem efeito.',
  'fpsBoot.holdsTwo':
    'Estas ranhuras contêm patches da taxa de fotogramas, mas nenhuma arranca, por isso os patches não têm efeito: {banks}.',
  'fpsBoot.wouldNotRun':
    'Aplicar o patch {target:dat} não a faria arrancar, porque a câmara arranca a partir {bank:gen}.',
  'fpsBoot.patchRunning':
    'Aplique também o patch {bank:dat} (a ranhura que arranca): é isso que faz o patch da taxa de fotogramas ter efeito.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: não pode receber o patch aqui ({reason}), por isso um patch da taxa de fotogramas noutra ranhura não tem efeito nesta câmara.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name:acc} (não está no plano desta compilação: o zip indica-o)',
  'backup.bank.unsupported':
    '{name:acc} (esta compilação não a consegue ler, {reason}: o zip indica-o)',
  'backup.bank.empty':
    '{name:acc} (vazia, todos os bytes a 0xFF: o zip indica-o, e a escrita não substitui nenhum firmware)',
  'backup.bank.unread':
    '{name:acc} (a leitura das ranhuras não chegou a ela: o zip indica se a leitura antes da escrita chega)',
  'backup.bank.noKey':
    '{name:acc} (tal como está guardada; nenhuma chave recuperada nesta leitura a abre, por isso não há ficheiro desencriptado)',
  'backup.bank.decrypted': '{name:acc} (tal como está guardada, e desencriptada)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Antes de qualquer escrita, {banks} é lida de novo e guardada num único zip, com uma nota sobre o que é cada ficheiro: {file}.',
  'backup.plan.many':
    'Antes de qualquer escrita, {banks} são lidas de novo e guardadas num único zip, com uma nota sobre o que é cada ficheiro: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'encriptada para que o dispositivo a guarde com a chave que a ranhura de arranque contém',
  'staging.detail.slotKeystreamCiphertext':
    'encriptada com a própria chave de envio da imagem (bloco de chaves 0); a câmara guarda-a com a própria chave da ranhura',
  'staging.detail.plain': 'sem encriptação, sem cifra',
  'staging.detail.keyAKeystream':
    'a imagem 1.3.0.8 FF tal como a aplicação do fabricante a prepara (XOR chave A) — a compilação de 16 Hz guarda-a com a chave B, não estes bytes',
  'staging.detail.verbatim': 'tal e qual — os bytes exatamente como foram dados',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'sem leitura',
  'copy.source.notInPlan': '{name:acc} não está no plano desta compilação',
  'copy.source.notRead': '{name:acc} não foi lida ({reason}), por isso não há imagem para copiar',
  'copy.source.empty': '{name:acc} está vazia: não há imagem para copiar',
  'copy.source.foreign':
    '{name:acc} não contém nenhuma imagem de firmware que esta leitura reconheça, por isso não há nada para copiar',
  'copy.source.noKey':
    'nenhuma chave recuperada nesta leitura abre {name:acc}, por isso não há imagem desencriptada para copiar',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} em {address}, tal como a leitura das ranhuras a desencriptou',
  'copy.fromVersion':
    '{name} em {address}, firmware {version}, tal como a leitura das ranhuras a desencriptou',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'A imagem é a {name:gen}, tal como a leitura das ranhuras a desencriptou: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'A imagem é a {name:gen}, tal como a leitura das ranhuras a desencriptou: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} da cópia de segurança (em {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': 'a {where}, no ficheiro de cópia de segurança completa {file}',
  'restore.fromVersion':
    'a {where}, no ficheiro de cópia de segurança completa {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'uma imagem da flash de 4 MB',
  'restore.kind.preserve-run': 'um ficheiro de execução do Preserve',
  'restore.kind.dump': 'um zip de «Dump e desencriptação 4.x/Nano»',
  'restore.kind.all-selectors': 'um zip de «Dump de todos os seletores»',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'uma imagem',
  'restore.decryptedTo.firmware': 'firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'A imagem é a da {where}, em {file}, {kind}: sha256 guardado {stored}, desencriptada para {decrypted} de {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'A imagem é a da {where}, em {file}, {kind} (o seu {entry}): sha256 guardado {stored}, desencriptada para {decrypted} de {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Depois da escrita, a releitura da ranhura é comparada com os bytes da ranhura guardados na cópia de segurança.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'O bloco de identidade da cópia de segurança indica esta câmara (número de série {serial}).',
  'restore.note.sameBytes':
    '{name:ins} já contém os bytes guardados na cópia de segurança: a escrita volta a pôr a mesma imagem.',
  'restore.warn.otherCamera':
    'Esta cópia de segurança parece ser de outra câmara: o bloco de identidade indica o número de série {theirs}, e esta câmara é {camera}. Só é escrita a imagem {name:gen}; não é escrito nada da identidade nem da calibração dessa câmara.',
  'restore.warn.noIdentity':
    'Esta cópia de segurança não tem bloco de identidade em {address}, por isso não é possível saber de que câmara foi lida.',
  'restore.warn.serialNotRead':
    'O número de série da câmara não foi lido, por isso a cópia de segurança (número de série {serial}) não pode ser comparada com ela.',
  'restore.warn.otherFirmware':
    'A {where} contém o firmware {version}, e a câmara executa {camera}: o restauro põe outro firmware na ranhura.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank:ins} não foi relida, por isso não é comparada com a cópia de segurança.',
  'restore.readBack.equal':
    'A releitura {bank:gen} corresponde byte a byte ao que a cópia de segurança guarda.',
  'restore.readBack.differs':
    '{bank}: a releitura difere dos bytes guardados na cópia de segurança em {count} B (o primeiro em {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, derivada {bank:gen} (a ranhura de arranque)',
  'keys.derived.holds':
    '{key} (a chave de armazenamento), derivada {bank:gen} (a ranhura de arranque), que contém {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, derivada da ranhura de arranque',
  'keys.derived.holdsUnnamed':
    '{key} (a chave de armazenamento), derivada da ranhura de arranque, que contém {holds:acc}',
  'keys.ffVendor.staged':
    'a imagem 1.3.0.8 FF (16 Hz) tal como a aplicação do fabricante a prepara: a imagem XOR o seu próprio bloco de chaves 0 (chave A), com a janela do cabeçalho inalterada, para qualquer ranhura; as chaves desta câmara não são usadas',
  'keys.ffVendor.stored':
    'Chave B: a câmara volta a encriptar o envio com o bloco de chaves 1 e guarda a imagem com ele',
  'keys.imageBlock0.staged':
    'a imagem com o seu próprio bloco de chaves 0 (encontrado na imagem pelo valor), para qualquer ranhura; as chaves desta câmara não são usadas',
  'keys.imageBlock0.storedUnnamed':
    'a chave com que o bootloader verifica uma ranhura (não identificada nesta leitura); a câmara volta a encriptar o envio com ela',
  'keys.imageBlock0.stored':
    '{key}, a chave com que o bootloader verifica uma ranhura; a câmara volta a encriptar o envio com ela',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (não testado): ainda não foi lido de nenhuma câmara um bootloader da compilação FF de 16 Hz, por isso não se sabe se a ranhura escrita arranca. Com o bootloader 0.9.0.0, uma forma anterior desta imagem arrancou a partir da ranhura de recuperação R; esta forma não vai arrancar, porque esse bootloader arranca a ranhura de recuperação R tal como está guardada, sem a descodificar.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'A imagem FF de 16 Hz é enviada na forma que só a compilação {version} de 16 Hz lê. Esta câmara escreve uma ranhura sem verificar a imagem (o código-fonte do firmware di-lo, e uma Compact 1.3.0.0 fê-lo quando se experimentou), por isso espera-se que escreva os bytes tal como são enviados: a ranhura fica então com a imagem numa forma que esta câmara não consegue arrancar.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nada aqui afirma que a câmara a arranca.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'As próprias respostas da câmara dizem que executa a compilação FF de 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'verifica os dados antes de apagar uma ranhura, e estes dados passam essa verificação, por isso pode escrever estes bytes tal como estão, numa forma que o seu bootloader não consegue arrancar: a ranhura pode não arrancar (não experimentado; a cópia de segurança guardada antes da escrita repõe-na)',
  'write.ff.outcome.refuses':
    'verifica os dados antes de apagar uma ranhura, e estes dados falham essa verificação, por isso espera-se que recuse esta escrita antes de escrever o que quer que seja (uma câmara com essa compilação recusou da mesma forma uma forma anterior desta imagem)',
  'write.ff.runsSlow':
    'A câmara executa a compilação {version} de 8 Hz: {why}. Essa compilação {outcome}.',
  'write.ff.buildUnknown':
    'As próprias respostas da câmara não dizem qual a compilação {version} que executa: {why}. Se executar a compilação FF de 16 Hz, aceita estes dados. Se executar a compilação de 8 Hz, essa compilação {outcome}.',
  'write.raw.asGiven':
    'Dados em bruto: enviados exatamente como foram dados. Nada aqui verifica se são arrancáveis.',
  'write.raw.ffStagedForm':
    'Estes dados estão na forma preparada da 1.3.0.8 FF (a imagem XOR bloco de chaves 0, soma de palavras 0xFFFF). A câmara guarda a imagem com a chave B, por isso a releitura é verificada contra esses bytes.',
  'write.raw.noStaging':
    'Esta compilação não indica nenhuma forma de preparação para a ranhura, por isso não é possível indicar as verificações do bootloader.',
  'write.raw.reencrypts':
    'O dispositivo descodifica estes dados e volta a encriptar o que guarda, por isso os bytes guardados não são previstos. A releitura é verificada como a imagem em que se desencripta, quando isso é possível.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'O bootloader rejeitaria estes dados: {failure}.',
  'write.raw.stageKeyUnchecked':
    'A chave de envio de 2016 (bloco de chaves 0) não está nos bytes em bruto, por isso a soma de palavras desencriptada destes dados não é verificada aqui.',
  'write.image.rekeyRisk':
    '{name:ins} já contém uma imagem que o bootloader não aceita. Esta escrita deixa-a no mesmo estado.',
  'write.ack.recovery':
    'Ranhura de recuperação R: escrevê-la pede-lhe que reconheça o risco. Nada aqui verifica se a câmara arranca depois.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: escrevê-la pede-lhe que reconheça o risco, e a câmara executa o que lá estiver depois de ser desligada e voltar a ser ligada.',
  'write.ack.bootUnnamed':
    'não foi possível identificar a ranhura de arranque, por isso esta é tratada como a ranhura de arranque',
  'write.ack.recoveryFallback':
    'A ranhura de recuperação R é a cópia de último recurso a que o bootloader recorre',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'vazio/0: preferir a ranhura A, depois B, depois a recuperação',
  'boot.cfg0.modernB': 'preferir a ranhura B, depois A, depois a recuperação',
  'boot.cfg0.modernRecovery': 'preferir a recuperação, depois A, depois B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'desconhecido — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  'upgrade.targetBooted':
    '{name:ins} é ao mesmo tempo a ranhura a partir da qual a câmara arrancou e a ranhura que a sua própria atualização escreve. Uma atualização feita a partir desta câmara substituiria a imagem que está a executar. Isto é apenas um aviso: nada aqui impede uma atualização.',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.targetBooted and upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'A câmara está a executar a ranhura de recuperação, e a sua própria atualização escreve {name:acc}, que não está a executar. {verdict} Isto é apenas um aviso: nada aqui impede uma atualização.',
  'upgrade.verdict.notRead':
    '{name:ins} não pôde ser lida nesta verificação, por isso não se sabe o que contém.',
  'upgrade.verdict.blank':
    '{name:ins} está vazia, por isso a atualização escreve numa ranhura vazia.',
  'upgrade.verdict.bootableSame':
    '{name:ins} contém a mesma imagem arrancável que a ranhura em execução, e a atualização substitui-a. {name:ins} fica incapaz de arrancar se a atualização parar a meio.',
  'upgrade.verdict.bootable':
    '{name}: contém uma imagem arrancável, que a atualização substitui. Se a atualização parar a meio, esta ranhura fica incapaz de arrancar.',
  'upgrade.verdict.unknown':
    'Nesta leitura não se sabe se {name:acc} é arrancável, por isso a atualização pode substituir uma imagem que a câmara arrancaria.',
  'upgrade.verdict.notBootable':
    '{name:ins} não aparece como arrancável nesta leitura, por isso a atualização não substitui nenhuma imagem que a câmara arrancaria.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — a ranhura em que o bootloader entrou neste arranque, tal como o regista',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'não lido',
  'report.lastStart.noBank': 'a câmara indica {word}, que não corresponde a nenhuma ranhura',
  'report.lastStart.entered':
    'a câmara indica que entrou {bank:loc} (palavra de ranhura ativa {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'sem versão',
  'running.why.otherVersion': 'a câmara indica {version}, e só a {only} tem duas compilações',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'a câmara não respondeu às avaliações das ranhuras (seletores 6, 7, 8 de GetFirmwareInfo)',
  'running.why.notRead':
    'uma ranhura de que as avaliações dependem não foi lida, por isso não é possível prever as respostas',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'a câmara responde {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, que é o que a compilação 1.3.0.8 de 8 Hz responde para estas ranhuras ({predicted})',
  'running.why.ff':
    '{answers}, que é o que a compilação 1.3.0.8 FF de 16 Hz responde para estas ranhuras ({predicted})',
  'running.why.both':
    '{answers}, e as duas compilações respondem exatamente isso para estas ranhuras, por isso as ranhuras não as distinguem',
  'running.why.neither':
    '{answers}, o que não corresponde a nenhuma das compilações (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'O cabeçalho desta imagem não indica nenhuma versão de firmware, por isso não é possível saber se é a compilação que a câmara executa ({camera}). Confirme que é a imagem que quer escrever.',
  'imageBuild.otherVersion': 'Esta imagem é o firmware {image}; a câmara executa {camera}.',
  'imageBuild.otherVersionTaken':
    'Esta imagem é o firmware {image}; a câmara executa {camera}. Nesta linha, a câmara só verifica se uma imagem está bem formada (o cabeçalho e a soma de palavras), não a versão, por isso aceita esta imagem e, quando arrancar a partir desta ranhura, executa {image}.',
  'imageBuild.otherVersionUnchecked':
    'Esta imagem é o firmware {image}; a câmara executa {camera}. Não foi verificado se esta câmara aceita uma compilação diferente, nem se a executa.',
  'imageBuild.otherBuild':
    'Esta imagem é a compilação {version} de 8 Hz; a câmara executa a compilação {version} FF de 16 Hz. A compilação de 16 Hz compara os dados com a sua própria forma FF quando são confirmados e recusa os que falham, antes de apagar a ranhura (segundo o seu código-fonte). Escrever nela a compilação de 8 Hz não foi experimentado numa câmara.',
  'imageBuild.runningUnknown':
    'Esta imagem é a compilação {version} de 8 Hz. A câmara executa {version}, que existe numa compilação de 8 Hz e numa FF de 16 Hz, e as próprias respostas da câmara não disseram qual executa, por isso não é possível saber se esta é a compilação dela.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort':
    'os dados têm {size} B, demasiado curtos para conterem um cabeçalho em 0x200',
  'bootFail.noMagic':
    'nenhum número mágico de imagem em 0x200 (encontrado {found}, o bootloader precisa de {needs})',
  'bootFail.lengthOutside': 'header.length {length} está fora dos dados de {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} não é o comprimento dos dados, {size}',
  'bootFail.overStage': '{size} B ultrapassa o limite de envio de {max} B',
  'bootFail.plainSum': 'soma de palavras guardada {sum}; o bootloader de 2014 precisa de 0',
  'bootFail.noFooter': 'nenhum rodapé em {offset}: os dados terminam em {end}',
  'bootFail.footerNotCode':
    'o rodapé em {offset} não é «CODE» — o bootloader usa o seu carregador segmentado',
  'bootFail.footerLength': 'o comprimento do rodapé não é igual a header.length {length}',
  'bootFail.keyASum':
    'desencriptada com a chave A desta câmara, a soma de palavras é {sum}; o bootloader precisa de {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'verificada pela soma de verificação',
  'keyConfidence.structural': 'verificada só pela tabela de vetores',
  'keyConfidence.unverified': 'não verificada',
  /** `{sum}` is hex. */
  'keyCheck.family': 'chave verificada pela soma de verificação {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'chave {phrase}; soma de verificação {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'preparado com as chaves da própria câmara',
  'staging.phrase.slotKeystreamCiphertext': 'preparado com a própria chave da imagem',
  'staging.phrase.plain': 'preparado sem encriptação',
  'staging.phrase.keyAKeystream':
    'preparado como a aplicação do fabricante prepara a imagem FF (XOR chave A)',
  'staging.phrase.verbatim': 'enviado tal como foi dado',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'confirmados {size} B {name:loc} em {address}, {staged}; estado da confirmação {status}',
  'written.noReadWindow':
    'esta compilação não indica nenhuma janela de leitura para a ranhura, por isso não foi relido nada',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'a releitura falhou: {error}',
  'written.readBack': 'relidos {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'a verificação está desativada: a ranhura não foi relida',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'os bytes que o plano previa que a ranhura contivesse (a imagem tal como a compilação de 16 Hz a guarda, não os bytes enviados)',
  'readBack.reference.asSent':
    'os bytes que o plano previa que a ranhura contivesse (os bytes tal como foram enviados)',
  'readBack.sizeDiffers':
    'a releitura tem {size} B e o plano previa {predictedSize} B: a ranhura NÃO corresponde ao esperado — {reference}',
  'readBack.matchesFolded':
    'a ranhura contém a imagem tal como a compilação de 16 Hz a guarda (não os bytes enviados), e o resto da ranhura está apagado',
  'readBack.matches':
    'a ranhura corresponde aos bytes que o plano previa (a cadeia sem encriptação de 2014 programa exatamente o que lhe é enviado)',
  'readBack.differs':
    'a ranhura NÃO corresponde ao esperado — {reference} (primeira diferença em {offset})',
  'readBack.noHeader':
    'a releitura não contém nenhum cabeçalho de imagem em {offset} (número mágico {magic}), por isso a ranhura NÃO se desencripta na imagem esperada',
  'readBack.lengthDiffers':
    'o cabeçalho da releitura indica {length} B e a imagem do plano tem {imageLength} B: a ranhura NÃO se desencripta na imagem esperada',
  'readBack.tooShort':
    'a releitura tem {size} B, demasiado curta para uma imagem de {length} B: a ranhura NÃO se desencripta na imagem esperada',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'o fluxo de chave recuperado da releitura ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'a ranhura desencripta-se na imagem esperada ({length} B) com {recovered}',
  'readBack.decryptDiffers':
    'a ranhura NÃO se desencripta na imagem esperada: primeira diferença no deslocamento {offset} da imagem, com {recovered}',
  'readBack.rawNotCompared':
    'bytes em bruto: releitura indicada, não comparada (os bytes não se desencriptam numa imagem simples que se possa prever nesta forma, e o dispositivo volta a encriptar o que guarda)',
  'readBack.notCompared':
    'não foi possível comparar: o plano não prevê nem os bytes guardados nem a imagem desencriptada',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'chave A',
  'keyName.keyA:acc': 'a chave A',
  'keyName.keyA:gen': 'da chave A',
  'keyName.keyA:dat': 'à chave A',
  'keyName.keyA:loc': 'na chave A',
  'keyName.keyA:ins': 'A chave A',
  'keyName.keyB': 'chave B',
  'keyName.keyB:acc': 'a chave B',
  'keyName.keyB:gen': 'da chave B',
  'keyName.keyB:dat': 'à chave B',
  'keyName.keyB:loc': 'na chave B',
  'keyName.keyB:ins': 'A chave B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'chave própria do dispositivo',
  'keyName.perDevice:acc': 'a chave própria do dispositivo',
  'keyName.perDevice:gen': 'da chave própria do dispositivo',
  'keyName.perDevice:dat': 'à chave própria do dispositivo',
  'keyName.perDevice:loc': 'na chave própria do dispositivo',
  'keyName.perDevice:ins': 'A chave própria do dispositivo',
  'keyName.thePerDevice': 'a chave própria do dispositivo',
  'keyName.thePerDevice:acc': 'a chave própria do dispositivo',
  'keyName.thePerDevice:gen': 'da chave própria do dispositivo',
  'keyName.thePerDevice:dat': 'à chave própria do dispositivo',
  'keyName.thePerDevice:loc': 'na chave própria do dispositivo',
  'keyName.thePerDevice:ins': 'A chave própria do dispositivo',
  'keyName.applicationKeyA': 'a chave A da aplicação',
  'keyName.applicationKeyA:acc': 'a chave A da aplicação',
  'keyName.applicationKeyA:gen': 'da chave A da aplicação',
  'keyName.applicationKeyA:dat': 'à chave A da aplicação',
  'keyName.applicationKeyA:loc': 'na chave A da aplicação',
  'keyName.applicationKeyA:ins': 'A chave A da aplicação',
  'keyName.applicationKeyB': 'a chave B da aplicação',
  'keyName.applicationKeyB:acc': 'a chave B da aplicação',
  'keyName.applicationKeyB:gen': 'da chave B da aplicação',
  'keyName.applicationKeyB:dat': 'à chave B da aplicação',
  'keyName.applicationKeyB:loc': 'na chave B da aplicação',
  'keyName.applicationKeyB:ins': 'A chave B da aplicação',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'bloco de chaves 1',
  'keyName.block1:acc': 'o bloco de chaves 1',
  'keyName.block1:gen': 'do bloco de chaves 1',
  'keyName.block1:dat': 'ao bloco de chaves 1',
  'keyName.block1:loc': 'no bloco de chaves 1',
  'keyName.block1:ins': 'O bloco de chaves 1',
  'keyName.theDeviceKey': 'a chave do dispositivo',
  'keyName.theDeviceKey:acc': 'a chave do dispositivo',
  'keyName.theDeviceKey:gen': 'da chave do dispositivo',
  'keyName.theDeviceKey:dat': 'à chave do dispositivo',
  'keyName.theDeviceKey:loc': 'na chave do dispositivo',
  'keyName.theDeviceKey:ins': 'A chave do dispositivo',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'chave desconhecida',
  'keyName.unknown:acc': 'a chave desconhecida',
  'keyName.unknown:gen': 'da chave desconhecida',
  'keyName.unknown:dat': 'à chave desconhecida',
  'keyName.unknown:loc': 'na chave desconhecida',
  'keyName.unknown:ins': 'A chave desconhecida',
  'keys.noKnownKey': 'nenhuma chave conhecida',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'a cadeia sem encriptação de 2014: todas as ranhuras são guardadas sem encriptação, por isso não é derivada nenhuma chave de envio; o envio é a imagem tal como está',
  'keys.evidence.ffVendor':
    'a compilação 1.3.0.8 FF (16 Hz): nenhuma ranhura que esta leitura abriu está guardada sem encriptação, por isso não está demonstrado que a câmara esteja na cadeia sem encriptação de 2014; a imagem FF é escrita na forma do fabricante, os bytes em bruto são enviados tal como foram dados, e uma imagem de 8 Hz sem encriptação não é escrita',
  'keys.evidence.ffUntested':
    'a escrita da imagem FF é disponibilizada com o seu aviso UNTESTED (não testado): o corpus não tem nenhum bootloader genuíno para esta compilação, por isso não foi medido se a ranhura escrita arranca',
  'keys.evidence.line2016':
    'a linha Compact PRO de 2016: um envio é a imagem XOR o fluxo de chave do seu próprio bloco de chaves 0, encontrado na imagem pelo valor, por isso não é construído com nenhuma chave desta câmara',
  'keys.evidence.checkKeyUnnamed':
    'a câmara desencripta o envio com essa chave e volta a encriptá-lo com a chave com que o bootloader verifica uma ranhura; essa chave não foi identificada nesta leitura, e a escrita não precisa dela: a releitura da ranhura é verificada como a imagem em que se desencripta',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'a câmara desencripta o envio com essa chave e volta a encriptá-lo com a chave com que o bootloader verifica uma ranhura; essa chave não foi identificada nesta leitura ({why}), e a escrita não precisa dela: a releitura da ranhura é verificada como a imagem em que se desencripta',
  'keys.evidence.checkKeyNamed':
    'a câmara desencripta o envio com essa chave e volta a encriptá-lo com {key:acc} {hex}, a chave com que o bootloader verifica uma ranhura, por isso cada ranhura que escreve fica guardada da forma que o bootloader aceita',
  'keys.evidence.checkKeyInferred':
    'a câmara desencripta o envio com essa chave e volta a encriptá-lo com {key:acc} {hex}, a chave com que o bootloader verifica uma ranhura (deduzida a partir {bank:gen}, a ranhura em que a câmara indica ter entrado, e na qual o bootloader entrou sem a verificar), por isso cada ranhura que escreve fica guardada da forma que o bootloader aceita',
  'keys.evidence.checkKeyNamedFrom':
    'a câmara desencripta o envio com essa chave e volta a encriptá-lo com {key:acc} {hex}, a chave com que o bootloader verifica uma ranhura (identificada a partir {bank:gen}, a ranhura em que a câmara indica ter entrado), por isso cada ranhura que escreve fica guardada da forma que o bootloader aceita',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'a aplicação em execução ({bank}, firmware {firmware}) tem a sua chave A {keyA} em {keyAAt} (fonte: {source})',
  'keys.evidence.applicationKeys':
    'a aplicação em execução ({bank}, firmware {firmware}) tem a sua chave A {keyA} em {keyAAt} (fonte: {source}) e a sua chave B {keyB} em {keyBAt}',
  'keys.source.keyTable': 'a tabela de chaves do bootloader',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'o par de chaves da aplicação descodificado de {builds}',
  'keys.evidence.perDevice':
    'está programada uma chave própria do dispositivo, por isso a aplicação volta a encriptar com ela',
  'keys.evidence.noPerDevice':
    'não está programada nenhuma chave própria do dispositivo, por isso a aplicação volta a encriptar com a sua própria chave B',
  'keys.evidence.storeKey':
    'a chave de armazenamento da aplicação é {key:acc} do bootloader ({hex}), por isso as escritas guardam todas as ranhuras com ela; {bank:acc} (a de arranque) contém {held:acc}, que o bootloader também aceita',
  'keys.evidence.bootedKey':
    '{bank:acc} (a de arranque) desencripta-se com {key:acc} ({hex}), uma chave que o bootloader experimenta; a chave de armazenamento da aplicação não é a do bootloader, por isso as escritas guardam todas as ranhuras com a chave da ranhura de arranque',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'o envio é a imagem XOR os fluxos de chave {masks:gen}; o dispositivo guarda a imagem com {key:acc}',
  /** `{held}` is a key name or keys.noKnownKey (a sentence, not a name: it takes no case). */
  'keys.evidence.otherBank':
    'a chave {bank:gen} é: {held}; a ranhura é escrita com {key:acc} pela mesma regra, e relida para verificar',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'não foi possível identificar a ranhura de arranque, por isso não é possível ler dela a chave com que a ranhura é guardada',
  'keys.refused.notDerived': 'não foi possível derivar as chaves',
  'keys.refused.notDecrypted':
    '{bank:acc} (a de arranque) não se desencripta numa imagem, por isso não é possível ler a chave com que está guardada',
  'keys.refused.noBootKey':
    '{bank:acc} (a de arranque) não se desencripta com nenhuma chave que o bootloader experimente (a sua chave A ou a sua chave de armazenamento), por isso não é possível ler dela a chave com que a ranhura é guardada',
  'keys.refused.keyNotInTable':
    '{bank:acc} (a de arranque) desencripta-se com {key:acc}, mas a tabela de chaves desta câmara não tem essa chave, por isso não é possível escrever com ela',
  'keys.refused.noApplicationPair':
    'a aplicação em execução ({bank}, firmware {firmware}) não tem nenhum dos pares de chaves conhecidos (o do bootloader e os pares de aplicação descodificados), com cada metade exatamente uma vez, por isso não é possível localizar a sua chave A na imagem',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'a aplicação em execução ({bank}, firmware {firmware}) não tem nenhum dos pares de chaves conhecidos (o do bootloader e os pares de aplicação descodificados), com cada metade exatamente uma vez, por isso não é possível localizar a sua chave A na imagem (a chave A do bootloader aparece {count} vez, a sua chave B {keyB})',
    many: 'a aplicação em execução ({bank}, firmware {firmware}) não tem nenhum dos pares de chaves conhecidos (o do bootloader e os pares de aplicação descodificados), com cada metade exatamente uma vez, por isso não é possível localizar a sua chave A na imagem (a chave A do bootloader aparece {count} de vezes, a sua chave B {keyB})',
    other:
      'a aplicação em execução ({bank}, firmware {firmware}) não tem nenhum dos pares de chaves conhecidos (o do bootloader e os pares de aplicação descodificados), com cada metade exatamente uma vez, por isso não é possível localizar a sua chave A na imagem (a chave A do bootloader aparece {count} vezes, a sua chave B {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'a aplicação em execução ({bank}, firmware {firmware}) verifica um envio com as suas próprias chaves antes de o programar (o código-fonte descodificado desta compilação experimenta o envio com a sua chave A e a sua chave de armazenamento, tal como o bootloader experimenta uma ranhura), e a chave com que as escritas guardam, {key} ({hex}), não é nem a sua chave A nem a sua chave de armazenamento, por isso a câmara recusaria o envio com 0x50000 antes de apagar o que quer que seja',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'nenhuma ranhura se desencripta na soma de verificação {sum} de {family}',
  'writeRefusal.keyTable': 'não foi possível confirmar a tabela de chaves desta câmara',
  'writeRefusal.whitening':
    'a tabela de chaves desta câmara resolve-se com K={k}, mas {family} encripta com K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'os indícios dizem que esta câmara é {detected}, não {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'esta câmara não pode ser escrita a partir daqui: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'As compilações da Seek de 2018 em diante (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 e Nano 300. Um dump lê 63 dos 64 blocos da flash sem desbloquear nada; nestas compilações, nenhuma leitura chega ao bloco em {block}. O firmware está guardado encriptado. As ranhuras são escritas uma de cada vez no separador «Gerir ranhuras de firmware».',
  'family.summary.early':
    'As Compact de 2014 anteriores a 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 e 0.7.0.8. O firmware delas não consegue responder à leitura que um dump envia, por isso «Dump», «Dump de todos os seletores», a leitura completa do separador Informação e o separador «Gerir ranhuras de firmware» recusam-nas depois de lerem a versão; na 0.3.0.1, o comando com que um dump começa prepararia, em vez disso, uma atualização de firmware. A execução de preservação lê a 0.7.0.7 e a 0.7.0.8 através de outro comando a que essas duas compilações respondem. Um dump feito de outra forma desencripta-se normalmente.',
  'family.summary.compact2016':
    'As compilações Compact PRO 1.0.3.x (1.0.3.0 e 1.0.3.2). Respondem às leituras exatamente como as Compact de 2014, incluindo o token de desbloqueio, por isso distinguem-se pela versão e pela forma como as ranhuras estão guardadas: encriptadas, enquanto as ranhuras de 2014 estão sem encriptação. Uma câmara 1.0.3.x é lida com esta família desde o início. A execução de preservação lê toda a flash, e as ranhuras são escritas uma de cada vez no separador «Gerir ranhuras de firmware».',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'As Compact de 2014 de 0.8.0.0 a 1.3.0.8, incluindo a compilação 1.3.0.8 FF de 16 Hz. Uma câmara sem alterações deixa ler menos de metade da flash, uma parte só com um token de desbloqueio que as ferramentas enviam; a execução de preservação lê o resto através de um patch temporário. As ranhuras estão guardadas sem encriptação, exceto na compilação FF. Uma câmara Compact PRO 1.0.3.x é lida como compact-2016, e só passa para aqui quando uma ranhura está guardada sem encriptação ou se desencripta em {sum}, como as da compilação FF. As ranhuras são escritas no separador «Gerir ranhuras de firmware» nas compilações em que a execução de preservação foi medida; qualquer outra compilação 0.x ou 1.x é só lida.',
  'family.summary.generic':
    'Uma câmara que não corresponde a nenhuma outra família. O `seek-fw dump` lê-a com a lista de blocos 4.x (o separador 4.x/Nano recusa-a), e uma desencriptação deduz a chave a partir da própria imagem, por isso nenhuma das duas depende do palpite. Não é escrita nenhuma ranhura: o separador «Gerir ranhuras de firmware» recusa-a até a câmara ser identificada.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'o cabeçalho da imagem indica',
  'detect.source.camera': 'a câmara indica',
  'detect.plainArmedNotInForce':
    'um BeginFirmwareUpgrade simples de 2 bytes abriu uma ranhura protegida, por isso o canal de leitura autenticado não está ativo',
  'detect.modern.plainRefused':
    'um BeginFirmwareUpgrade simples de 2 bytes de uma ranhura protegida foi RECUSADO, o que nenhuma compilação desta linha faz — o seu handler não verifica nenhum token e aceita o canal simples em todas as ranhuras',
  'detect.modern.authArmed':
    'uma ranhura protegida abriu-se com o seletor autenticado de 18 bytes; o simples não foi experimentado aí, por isso isto não coloca esta câmara fora desta linha',
  'detect.modern.legacyVersion':
    '{said} firmware {version}, que está na linha antiga 0.x / 1.x (uma numeração diferente, não uma 4.x mais antiga — e uma dessas compilações também dá a soma {sum})',
  'detect.modern.noSum':
    'nenhuma ranhura se desencripta na soma de verificação {sum} que o bootloader desta família exige',
  'detect.modern.sum': 'uma ranhura desencripta-se na soma de verificação {sum}',
  'detect.modern.version':
    'o firmware {version} está na linha posterior a 2018 que este mapa de seletores cobre (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'um BeginFirmwareUpgrade simples de 2 bytes abriu uma ranhura protegida, por isso este não é o firmware antigo bloqueado',
  'detect.modern.none': 'nenhum indício coloca esta câmara na linha posterior a 2018',
  'detect.early.noVersion':
    'não foi indicada nem encontrada num cabeçalho de imagem nenhuma versão de firmware',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'o firmware {version} é {first} ou posterior, por isso a sua tabela RPC tem um getter para GetFeaturedFirmwareData e aplica-se o caminho de leitura normal',
  'detect.early.older':
    '{said} firmware {version}, que é anterior a {first} — a primeira compilação cuja tabela de métodos RPC tem um handler de leitura (getter) para GetFeaturedFirmwareData',
  'detect.early.noWindow': 'e não foi possível ler nenhuma janela, que é o que isso prevê',
  'detect.generic.fallback':
    'alternativa: nenhuma família de firmware correspondeu com confiança, por isso as leituras ficam disponíveis e as escritas não',
  'detect.compact2016.early':
    'o firmware {version} é anterior a 0.8.0.0 e não tem handler de leitura para GetFeaturedFirmwareData — isso é early-compact, não esta família',
  'detect.compact2016.modernSum':
    'uma ranhura desencripta-se na soma de verificação {sum}, que não é o valor desta geração',
  'detect.compact2016.plainArmed':
    'um BeginFirmwareUpgrade simples de 2 bytes abriu uma ranhura protegida, por isso esta câmara não está na linha bloqueada que esta família partilha com legacy-auth',
  'detect.compact2016.notLine': 'o firmware {version} não está na linha 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'uma ranhura está guardada sem encriptação — a resolução do fluxo de chave devolve o estado identidade, por isso as palavras guardadas SÃO a imagem —, o que corresponde à cadeia sem encriptação de 2014; as ranhuras desta geração estão em xorshift128 com uma chave real',
  'detect.compact2016.keyedZero':
    'uma ranhura guardada com um fluxo de chave xorshift128 real desencripta-se na soma de verificação {sum}, que é a cifra desta geração',
  'detect.compact2016.zeroSum':
    'uma ranhura desencripta-se na soma de verificação {sum}, que é o valor desta geração',
  'detect.compact2016.refused':
    'e uma ranhura protegida recusou a abertura simples de 2 bytes, que é o comportamento do handler bloqueado',
  'detect.compact2016.proLine': '{said} firmware {version}, a linha 1.0.3.x da Compact PRO de 2016',
  'detect.compact2016.compactLine':
    '{said} firmware {version}, uma compilação Compact, não a linha 1.0.3.x da Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmware {version}, na linha 0.x / 1.x que esta geração partilha com o firmware antigo bloqueado',
  'detect.compact2016.bootloader2016':
    'o bootloader indica {version}, um bootloader da geração de 2016 (o 1.2.0.0 foi medido com a Compact PRO 1.0.3.0; o da Compact de 2014 é o 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'o bootloader indica {version}, a numeração da geração de 2014, não a desta geração',
  'detect.compact2016.none':
    'não se observou nenhuma ranhura a desencriptar-se numa soma de verificação zero com uma chave real',
  'detect.legacy.proLine':
    'mas o firmware {version} é da linha 1.0.3.x da Compact PRO de 2016, cujas ranhuras usam a cifra de compact-2016: a verificação de aceitação desta família falharia em todas elas',
  'detect.legacy.early':
    'o firmware {version} é anterior a 0.8.0.0: a sua tabela RPC não tem handler de leitura para GetFeaturedFirmwareData (nenhum antes de 0.7.0.7, e apenas um setter em 0.7.0.7 e 0.7.0.8) — isso é early-compact, não esta família',
  'detect.legacy.keyedZero':
    'uma ranhura guardada com um fluxo de chave xorshift128 real desencripta-se em {zero} — a cifra da Compact PRO de 2016 (compact-2016). Esta linha guarda as ranhuras sem encriptação, com uma soma de palavras de 0 (a cadeia de 2014) ou ajustada para {sum} (Compact 1.3.0.8), e a sua verificação de aceitação falha numa ranhura assim',
  'detect.legacy.plainChain':
    'uma ranhura está guardada como firmware sem encriptação cujas palavras somam 0, tal como o bootloader de 2014 desta linha a arranca',
  'detect.legacy.refused':
    'a câmara recusou abrir uma ranhura bloqueada para uma atualização quando lhe foi pedido sem o desbloqueio, como só esta geração de firmware faz',
  'detect.legacy.unlocked':
    'e abriu a mesma ranhura quando lhe foi pedido com o desbloqueio, por isso o desbloqueio que esta família envia é o que esta câmara verifica',
  'detect.legacy.notLine': '{said} firmware {version}, que não está na linha antiga 0.x / 1.x',
  'detect.legacy.authOnly':
    'abriu uma ranhura bloqueada para uma atualização quando lhe foi pedido com o desbloqueio, como esta geração de firmware faz; não se experimentou pedir sem o desbloqueio, por isso isto, por si só, não prova a geração',
  'detect.legacy.version':
    'o firmware {version} está na linha antiga 0.x / 1.x, que tem uma numeração diferente da das versões de aplicação posteriores a 2018, e não é uma 4.x mais antiga',
  'detect.legacy.none': 'nada do que foi observado aponta para o canal de leitura autenticado',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'retido depois de uma execução numa câmara: aí o patch não aumentou a taxa de publicação, e o obturador disparou em cada fotograma depois da escrita',
  'fps.table.predates':
    'o firmware {version} é anterior a 0.8.0.0: a sua tabela RPC não tem handler de leitura para GetFeaturedFirmwareData, o comando que uma leitura de ranhura envia, por isso a leitura e a escrita de ranhuras não abrangem nenhuma ranhura desta compilação, e o patch não está disponível',
  'fps.table.stageTwoFf':
    'stage two: a compilação FF de 16 Hz é preparada como a aplicação do fabricante a prepara (a imagem XOR chave A, guardada com a chave B), não como bytes simples, por isso a sua verificação de preparação não é feita e o patch ainda não está disponível',
  'fps.table.stageTwo':
    'stage two: esta entrada não está no conjunto stage two, por isso a sua verificação de preparação não é feita e o patch ainda não está disponível',
  'fps.table.notOffered': 'indisponível',
  'fps.table.notImage':
    'isto não é uma imagem de firmware, por isso não se lhe aplica nenhum patch da taxa de fotogramas',
  'fps.table.otherBuild':
    'a imagem é a compilação {image} («{id}»), mas a câmara indica {camera}; o patch é recusado em vez de ser aplicado a uma compilação a que não corresponde',
  'fps.table.otherBuildNoVersion':
    'a imagem é a compilação {image} («{id}»), mas a câmara não indica nenhuma versão; o patch é recusado em vez de ser aplicado a uma compilação a que não corresponde',
  'fps.table.patched':
    'o patch da taxa de fotogramas já está aplicado: esta imagem funciona a {hz} Hz',
  'fps.table.earlierPatch':
    'esta imagem tem um patch anterior da taxa de fotogramas de {hz} Hz sem a correção do USB, e um patch nunca é aplicado a uma imagem que já tem patch: reponha a imagem original e depois aplique o patch',
  'fps.table.atRate': 'esta compilação já funciona a {hz} Hz sem patch',
  'fps.table.not4821':
    'esta imagem indica a compilação Compact 4.8.2.1 (ou a Compact XR 4.8.2.1, a mesma compilação), mas não é a imagem original para a qual o patch da taxa de fotogramas foi escrito (f96ac57eda75: as suas páginas de comandos de 68 bytes, página estável 13), por isso não é feito nenhum patch da taxa de fotogramas para ela',
  'fps.table.notInTable':
    'esta imagem não está na tabela de patches da taxa de fotogramas, por isso não é feito nenhum patch da taxa de fotogramas para esta compilação. A tabela inclui as compilações Compact 0.7.0.8 a 1.3.0.8 (8 Hz; a 0.7.0.8 é recusada pelo código das ranhuras), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 e 4.16.1.7 FF e as compilações Compact PRO 1.0.3.x e 4.9.x; nenhuma outra compilação tem entrada',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'o plano desta compilação não tem {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain':
    '{bank:acc} não pode receber uma imagem desencriptada nesta compilação: {reason}',
  'fps.plan.empty': '{bank:acc} não tem nenhuma imagem desencriptada para o patch (está vazia)',
  'fps.plan.noImage':
    '{bank:acc} não tem nenhuma imagem desencriptada para o patch (não foi lida ou nenhuma chave a abre)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name:ins} foi escrita, mas a sua releitura não difere da ranhura guardada apenas como planeado, por isso as ranhuras seguintes não foram escritas',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    'A ranhura de arranque indicada nesta linha de firmware é a ranhura em que a câmara entrou no último arranque, tal como a palavra de ranhura ativa a regista (0 ranhura A, 1 ranhura B, 2 ranhura de recuperação R). O próximo arranque é definido pela palavra de configuração de arranque: 0 ou 0xFFFFFFFF escolhem primeiro A, 1 primeiro B, qualquer outro valor primeiro a ranhura de recuperação R. A ranhura de recuperação R arranca sempre que A e B não contêm nada que o bootloader de 2014 aceite (uma ranhura cujas palavras somam 0), seja o que for que R contenha (medido numa câmara).',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    'A ranhura de arranque indicada nesta linha de firmware é a ranhura em que a câmara entrou no último arranque, tal como o bootloader a regista na palavra de ranhura ativa (0 ranhura A, 1 ranhura B, 2 ranhura de recuperação R). O próximo arranque é definido pela palavra de configuração de arranque: 0 ou 0xFFFFFFFF escolhem primeiro A, 1 primeiro B, qualquer outro valor primeiro a ranhura de recuperação R. O bootloader de 2016 só aceita uma ranhura quando esta se desencripta numa soma de palavras de 0 com a chave com que verifica uma ranhura (o bloco de chaves 1 no seu bootloader 1.2.0.0), e a última ranhura dessa ordem arranca sem verificação quando as outras duas falham. A leitura identifica essa chave a partir da ranhura em que a câmara entrou, porque o bloco do bootloader que a contém é recusado em todos os canais (medido numa câmara).',
  'notes.ep0of1032':
    '1.0.3.2: as sessões EP0 morrem por volta dos 64 a 81 KB e 128 B é a unidade de leitura sem perdas, por isso uma ranhura de 64 KB por sessão é o limite medido. A leitura completa da flash é recusada nesta compilação (PRESERVATION.md: não existe leitura completa com uma só abertura). O dump de ranhuras lê uma ranhura de cada vez, em pedidos de 64 bytes.',
  'notes.token':
    'As ranhuras estão bloqueadas nesta linha: a câmara só abre uma ranhura para escrita quando o pedido traz o desbloqueio da linha, que é o mesmo em todas as 22 imagens de firmware desta linha registadas. Uma câmara com outro desbloqueio recusa as suas ranhuras.',
  'notes.staging.lockedPlain':
    'Preparação: a própria imagem, no máximo 56 KB (o máximo que a câmara aceita numa escrita). A escrita apaga a ranhura de 64 KB e escreve exatamente esses bytes, e o resto da ranhura fica apagado. O bootloader só arranca uma ranhura quando as suas palavras somam 0, por isso a imagem é equilibrada para essa soma antes de ser enviada.',
  'notes.staging.locked2016':
    'Preparação: a imagem, XOR o fluxo de chave xorshift128 do seu PRÓPRIO bloco de chaves 0 (a chave de envio, encontrada na imagem pelo valor), só com o comprimento da imagem (no máximo 0xE000 bytes). O dispositivo desencripta os dados com essa chave e guarda-os com a chave com que o bootloader verifica uma ranhura (bloco de chaves 1), por isso os bytes guardados não são os preparados. Não se lê nada da ranhura de destino para a preparação: o fluxo de chave da ranhura só é usado para a reler.',
  'notes.staging.modern':
    'Preparação: a ranhura inteira de 64 KB, imagem + preenchimento 0xFF + rodapé «CODE». A imagem é combinada por XOR com os fluxos de chave que fazem com que as duas passagens da própria aplicação em execução a guardem com a chave que a ranhura de arranque contém: quando o comando de confirmação (CompleteMemoryUpgrade) recebe o tipo de dados 7, 8 ou 9, a aplicação desencripta o envio com a sua chave A, volta a encriptá-lo com a sua chave de armazenamento e programa a ranhura. O rodapé é o que permite ao bootloader aceitar a ranhura, por isso uma ranhura sem ele é recusada.',
  'notes.modernGap':
    'A ranhura B está em 0x14050000 nesta linha (modo 8). Nenhum seletor chega a 0x14060000 em nenhuma compilação 2.x, 4.x, 10.x, 42.x ou 44.x (descodificado das 14 imagens do corpus posteriores a 2018), por isso não há nenhuma ranhura aí. A disposição com 0x14060000 pertence à linha bloqueada 0.x/1.x.',
  'notes.modernNamedWrite':
    'As escritas com nome (modos 7 a 9) foram descodificadas do firmware. O emulador escreve A, B e R através delas nas compilações 4.x, e numa câmara a ranhura A de uma Compact XR 4.8.2.1 foi escrita através do modo 7 pelo patch da taxa de fotogramas. Uma escrita de ranhura nunca abre o modo 0, o destino da atualização.',
  'notes.unverified':
    'Só leitura. A disposição das ranhuras é a tabela descodificada da linha bloqueada, mas não foi medida nenhuma forma de preparação para esta compilação, por isso não é planeada nenhuma escrita.',
  'notes.empty.plain':
    'Uma ranhura vazia recebe uma imagem exatamente como uma ranhura usada. A cadeia sem encriptação prepara os bytes da imagem tal como estão, sem chave, e a confirmação da escrita apaga primeiro o bloco, por isso não se lê nada da ranhura de destino. Medido numa Compact: uma imagem escrita numa ranhura B vazia foi relida idêntica, e B arrancou sozinha.',
  'notes.empty.modern':
    'Uma ranhura vazia recebe uma imagem exatamente como uma ranhura usada. Os dados são encriptados com chaves derivadas da ranhura de arranque e da aplicação em execução, não da ranhura de destino, e o dispositivo volta a encriptá-los e apaga o bloco sem o ler. O rodapé é copiado de uma ranhura que tenha um válido; caso contrário, é criado em branco. Provado no emulador; ainda não medido numa câmara.',
  'notes.empty.locked2016':
    'Uma ranhura vazia recebe uma imagem exatamente como uma ranhura usada. A chave de envio é o bloco de chaves 0 do par da própria IMAGEM, não uma chave lida da ranhura de destino, e o dispositivo desencripta os dados com ela, guarda-os com a sua própria chave e apaga o bloco sem o ler. Provado no emulador; ainda não medido numa câmara.',
  'notes.mode2of080':
    '0.8.0.0: nesta compilação, o modo 2 (0x14000000) pode bloquear a câmara: uma leitura aberta sai da SRAM (PRESERVATION.md). Uma leitura ou escrita de ranhura só abre os modos 7 a 9 e nunca o modo 2.',
  'notes.keyPairs2016':
    'As compilações de 9 Hz da 1.0.3.0 e da 1.0.3.2 partilham um par de chaves, e as compilações FF partilham outro. O texto da versão não as distingue, por isso o fluxo de chave é recuperado da própria ranhura e é a imagem da própria ranhura que decide.',
  'notes.board1030':
    'A aplicação 1.0.3.0 reinicia em qualquer placa que não seja a da Compact Pro, por isso uma placa Compact só a executa com o patch de placa nas suas ranhuras.',
  'notes.bank.modernA':
    'Escrita através de uma abertura de ranhura que o mapa moderno deixa de fora; uma Compact XR 4.8.2.1 aceitou uma escrita por ela numa câmara.',
  'notes.bank.recovery2016':
    'Medido numa Compact PRO 1.0.3.0: a ranhura de recuperação R aceitou a sua própria imagem, uma alteração de um byte e os bytes em bruto tal como foram enviados, cada um escrito sem erro.',
  'notes.bank.ff1308A':
    'A imagem 1.3.0.8 FF (16 Hz) vai para aqui na forma em que a aplicação do fabricante a envia, e a câmara guarda-a com a sua própria chave. O bootloader de 2014 só arranca uma ranhura quando as suas palavras somam 0, por isso ignora esta no arranque; se a compilação de 16 Hz arranca a partir da ranhura A está UNTESTED (não testado). A imagem de 8 Hz é escrita tal como está.',
  'notes.bank.ff1308B':
    'A imagem 1.3.0.8 FF (16 Hz) vai para aqui na forma em que a aplicação do fabricante a envia, e a câmara guarda-a com a sua própria chave. O bootloader de 2014 só arranca uma ranhura quando as suas palavras somam 0, por isso ignora esta no arranque; se a compilação de 16 Hz arranca a partir da ranhura B está UNTESTED (não testado). A imagem de 8 Hz é escrita tal como está.',
  'notes.bank.ff1308R':
    'A imagem 1.3.0.8 FF (16 Hz) vai para aqui na forma em que a aplicação do fabricante a envia, e a câmara guarda-a com a sua própria chave. O bootloader 0.9.0.0 arranca a ranhura de recuperação R tal como está guardada, sem a descodificar, por isso esta forma pode não arrancar: UNTESTED (não testado), e uma forma anterior desta imagem arrancou a partir daqui (medido numa câmara). A imagem de 8 Hz é escrita tal como está.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 e Compact XR 4.8.2.1 (uma só imagem): o mapa moderno de 63 janelas; o emulador confirmou 63 de 63 janelas no dump completo da Compact e no da Compact XR.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31: o mapa moderno de 63 janelas, com todas as janelas confirmadas no emulador.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33: o mapa moderno de 63 janelas, com todas as janelas confirmadas no emulador.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10: o mapa moderno de 63 janelas, com todas as janelas confirmadas no emulador. O seu comando de confirmação (CompleteMemoryUpgrade) não tem handler para o tipo de dados 32, que uma escrita pelos modos 7, 8 ou 9 nunca pede.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10: o mapa moderno de 63 janelas, com todas as janelas confirmadas no emulador. O seu comando de abertura (BeginFirmwareUpgrade) recusa um tipo de dados para lá do intervalo que aceita (0x7F) como primeiro argumento inválido, e os modos 7 a 9 estão dentro desse intervalo.',
  'notes.ff1308':
    'A 1.3.0.8-FF (16 Hz) indica a mesma versão que a compilação de 8 Hz. A leitura distingue-as a partir da câmara: a câmara diz, ranhura a ranhura, se a sua aplicação aceita a ranhura, e cada compilação prevê as suas próprias respostas a partir das ranhuras. A imagem FF é enviada na forma em que a aplicação do fabricante a envia, e a câmara guarda-a com a sua própria chave. Vai para a ranhura A, a ranhura B ou a ranhura de recuperação R. Espera-se que a compilação de 8 Hz a recuse antes de escrever o que quer que seja; enquanto as respostas da câmara não distinguirem as compilações, o plano diz o que cada compilação faz com ela. {untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'a câmara não indicou a versão do firmware ({note}); um número de comando não significa o mesmo em todo o firmware Seek — na Compact 0.3.0.1, o wire id 0x52, o id que abre uma janela de leitura, é EnterBootloaderMode —, por isso, até a versão ser conhecida, só são enviados GetErrorCode, GetOperationMode e GetFirmwareInfo, as leituras a que todas as compilações respondem da mesma forma',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo não respondeu ({error}) em nenhuma de {reads} leituras com {spacing} ms de intervalo, uma janela de arranque de {window} ms; uma câmara que ainda está a arrancar responde dentro dela',
  'identity.note.neverTwice':
    'GetFirmwareInfo nunca respondeu duas vezes seguidas em {reads} leituras',
  'identity.note.noAnswer': 'GetFirmwareInfo não respondeu ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo não respondeu ({error}); {answered} de {reads} leituras tiveram resposta, nunca duas seguidas, por isso nenhuma delas se distingue de um registo que um comando anterior deixou selecionado',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo respondeu {count} byte, demasiado pouco para uma versão',
    many: 'GetFirmwareInfo respondeu {count} de bytes, demasiado poucos para uma versão',
    other: 'GetFirmwareInfo respondeu {count} bytes, demasiado poucos para uma versão',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo respondeu {count} byte, demasiado pouco para uma versão; {context}',
    many: 'GetFirmwareInfo respondeu {count} de bytes, demasiado poucos para uma versão; {context}',
    other: 'GetFirmwareInfo respondeu {count} bytes, demasiado poucos para uma versão; {context}',
  },
  'identity.note.otherRecord':
    'a primeira leitura respondeu com outro registo ({version}), no qual um comando anterior tinha deixado o seletor de informação do firmware — essa leitura limpou-o',
  'identity.note.afterStartup': {
    one: 'respondeu depois de recusar {count} leitura durante o arranque',
    many: 'respondeu depois de recusar {count} de leituras durante o arranque',
    other: 'respondeu depois de recusar {count} leituras durante o arranque',
  },
  'identity.predates':
    'o firmware {version} é anterior ao protocolo de dump: a sua tabela de métodos RPC não tem handler de leitura para GetFeaturedFirmwareData (na 0.7.0.7 e na 0.7.0.8 está registado só como setter, e antes disso o wire id 0x4F é UploadFirmwareRowSize), por isso não é possível ler nenhuma janela com ele; na 0.3.0.1, o wire id 0x52 é EnterBootloaderMode e não BeginFirmwareUpgrade. Em vez disso, a execução de preservação lê a 0.7.0.7 e a 0.7.0.8 através do wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'recusa-se a {operation}: {reason}',
  'identity.refusingNoVersion':
    'recusa-se a {operation}: {reason}. Não foi aberta nenhuma janela. Desconecte a câmara, volte a conectá-la, deixe-a terminar o arranque e tente de novo.',
  'identity.operation.dump': 'fazer o dump',
  'identity.operation.dumpAll': 'fazer o dump de todos os seletores',
  'identity.operation.readInfo': 'ler as informações do dispositivo',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'as ranhuras são escolhidas depois da cópia de segurança, que as lê — faça primeiro a cópia de segurança',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'as ranhuras não podem mudar depois de a escrita ter sido feita ou tentada (esta execução escreve: {banks}), e o restauro repõe exatamente essas ranhuras',
  'preserve.banks.none': 'nenhuma ranhura',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Escrito.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Lido. {count}/{of} ranhuras legíveis.',
  'status.readRefused':
    'Lido, mas nenhuma ranhura desta câmara pode ser escrita a partir daqui — veja o registo.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Versão do firmware',
  'compare.field.imageId': 'Id da imagem',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'SP inicial',
  'compare.field.resetVector': 'Vetor de reset',
  'compare.field.size': 'Tamanho',
  'compare.field.shaExpected': 'SHA-256 da imagem desencriptada esperada',
  'compare.field.sha': 'SHA-256 da imagem',
  'compare.field.shaNotStored':
    'SHA-256 da imagem desencriptada esperada (bytes guardados não previstos)',
  'compare.field.key': 'Chave',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(sem imagem)',
  'compare.notImage': '(não é uma imagem)',
  'compare.notPredicted': '(não previsto: é o dispositivo que decide o que guarda)',
  'compare.plaintext': 'nenhuma (sem encriptação)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'não pôde ser lida da mesma forma duas vezes',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (a chave com que o bootloader verifica uma ranhura é deduzida a partir {bank:gen}, na qual entrou sem a verificar) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, tal como a câmara o regista (palavra de ranhura ativa {word})',
  'preserve.lastStart.notRead': 'desconhecido — não foi possível ler a palavra de ranhura ativa',
  'preserve.lastStart.noBank':
    'desconhecido — a palavra de ranhura ativa é {word}, que não corresponde a nenhuma ranhura',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'desconhecido — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'não escrita — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'uma imagem',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — pode ser escrita',
  'preserve.bank.writablePatch': '{build} — pode ser escrita; o patch altera {count} bytes',
  'preserve.bank.writableEdit': '{build} — pode ser escrita; inclui {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — pode ser escrita; o patch altera {count} bytes; inclui {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'a cópia de segurança ainda não leu as ranhuras, por isso não pode ser escolhida nenhuma ranhura',
  'preserve.choice.every': 'todas as ranhuras que contêm uma imagem: {banks}',
  'preserve.choice.everyBlocked':
    'não é possível escrever todas as ranhuras que contêm uma imagem: {bank:acc} não pode — {reason}',
  'preserve.choice.noImage': 'nenhuma ranhura contém uma imagem que a execução possa escrever',
  'preserve.choice.nextStart': '{bank}, a ranhura do próximo arranque: {why}',
  'preserve.choice.nextStartRefused':
    'o próximo arranque entra {bank:loc} ({why}), e a execução não a pode escrever: {reason}',
  'preserve.choice.everyUnknownStart':
    'todas as ranhuras que contêm uma imagem ({banks}): não se sabe em que ranhura entra o próximo arranque ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'não se sabe em que ranhura entra o próximo arranque ({why}), e {reason}; escolha uma ranhura pelo nome',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank:acc} não pode ser escrita: {reason}',
  'preserve.choice.byName': '{banks}, a ranhura escolhida pelo nome',
  'preserve.choice.warnNotPatched':
    'O próximo arranque entra {bank:loc} ({why}), e esta escolha não lhe aplica o patch: depois do reinício, a câmara executa a própria imagem dessa ranhura, por isso a leitura completa da flash para antes de ler o que quer que seja. O restauro continua a repor todas as ranhuras escritas.',
  'preserve.choice.warnUnknownStart':
    'Não se sabe em que ranhura entra o próximo arranque ({why}). Se entrar numa ranhura a que esta escolha não aplica o patch, a leitura completa da flash para antes de ler o que quer que seja.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'ainda desconhecida',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'tal como a câmara o guarda (esta câmara guarda o firmware sem encriptação)',
  'preserve.stagedForm.oneKey':
    'na forma em que a câmara o guarda (encriptado com a chave da câmara)',
  'preserve.stagedForm.twoKeys':
    'na forma em que a câmara o guarda (encriptado com as duas chaves da câmara)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'cada ranhura escrita recebe de volta exatamente os bytes que a cópia de segurança leu dela',
  'preserve.restoreForm.factoryStaged':
    'cada ranhura escrita recebe de volta o seu firmware original, escrito na forma em que a câmara o guarda, por isso a ranhura fica byte a byte como a cópia de segurança a leu',
  'preserve.restoreForm.none':
    'impossível nesta compilação: nenhuma forma do firmware original passa a verificação da própria câmara e fica também guardada como os bytes originais, por isso a execução termina com a imagem completa e o patch ainda no lugar',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'impossível nesta compilação: o firmware com o patch não consegue ler toda a flash, por isso a execução não tem imagem completa para dar',
  'preserve.drain.rotated': 'a câmara entrega-a rodada, e a execução volta a pô-la por ordem',
  'preserve.drain.hazard': 'o patch evita uma leitura que, nesta compilação, bloqueia a câmara',
  'preserve.drain.whole': 'toda a flash de 4 MB numa só leitura, {size} bytes de cada vez',
  'preserve.drain.wholeNotes':
    'toda a flash de 4 MB numa só leitura, {size} bytes de cada vez; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'permite que o comando de leitura da câmara chegue a toda a flash de 4 MB, e não só aos primeiros 64 KB',
  'preserve.site.countPast':
    'permite que a posição de leitura passe dos 64 KB, para que uma leitura não volte ao início',
  'preserve.site.keepPosition':
    'mantém a posição de leitura completa quando avança depois de cada leitura',
  'preserve.site.savePosition': 'guarda por inteiro a posição de leitura avançada',
  'preserve.site.clearPosition':
    'limpa a posição de leitura completa sempre que uma leitura começa, para que a câmara continue legível depois da leitura completa',
  'preserve.site.modeTwoGuard':
    'deixa a leitura completa começar como qualquer outra leitura (o firmware original recusa-a)',
  'preserve.site.modeTwoIndirection':
    'aponta a leitura completa para o início da flash (o firmware original aponta-a para um valor que bloqueia a câmara)',
  'preserve.site.armTail':
    'remove uma chamada que bloqueia a câmara quando uma leitura começa nesta compilação',
  'preserve.site.other': 'altera uma instrução de que a leitura completa precisa',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Cópia de segurança',
  'preserve.step.patch': 'Patch',
  'preserve.step.commit': 'Escrita',
  'preserve.step.drain': 'Leitura completa',
  'preserve.step.restore': 'Restauro',
  'preserve.step.verify': 'Verificação',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'o patch',
  'preserve.stepId.commit': 'a escrita',
  'preserve.stepId.drain': 'a leitura completa',
  'preserve.stepId.restore': 'o restauro',
  'preserve.stepId.verify': 'a verificação',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: parado como previsto — a câmara arrancou a partir {bank:gen}, a que esta execução não aplicou o patch, por isso não foi lido nada.',
  'preserve.result.noReason': 'não foi registado nenhum motivo',
  'preserve.result.stopped': '{label}: parado — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'nenhuma ranhura contém firmware a que a execução possa aplicar o patch',
  'preserve.result.writable.one':
    '{banks:acc} contém firmware a que a execução pode aplicar o patch',
  'preserve.result.writable.many':
    '{banks:acc} contêm firmware a que a execução pode aplicar o patch',
  'preserve.result.backup':
    '{label}: foi guardado cada bloco a que uma leitura normal chega; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'uma ranhura desconhecida',
  'preserve.result.backupNext':
    '{label}: foi guardado cada bloco a que uma leitura normal chega; {writable}; próximo arranque: {next}.',
  'preserve.result.patch': '{label}: preparado para {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: não foi preparado nenhum patch: nenhuma ranhura contém firmware a que a execução possa aplicar o patch.',
  'preserve.result.patchCount':
    '{label}: preparado para {banks:acc}; mudam {count} bytes em cada uma.',
  'preserve.result.commitOne':
    '{label}: {banks:acc} foi escrita com o patch, e a câmara aceitou-a.',
  'preserve.result.commitMany':
    '{label}: {banks:acc} foram escritas com o patch, e a câmara aceitou cada uma.',
  'preserve.result.drainNotRead': '{label}: não lida.',
  'preserve.result.drain':
    '{label}: foi lida toda a flash de 4 MB; a imagem completa tem sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: foi lida toda a flash de 4 MB através {bank:gen}; a imagem completa tem sha256 {sha256}.',
  'preserve.result.restore': '{label}: o original foi escrito de volta {banks:loc}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: o original foi escrito de volta {banks:loc}, {form}.',
  'preserve.result.verifyDone': '{label}: concluída.',
  'preserve.result.verifyIdentical':
    '{label}: {blocks} blocos lidos de novo, 0 bytes diferentes — a flash da câmara é idêntica byte a byte à cópia de segurança.',
  'preserve.result.verifyDiffers':
    '{label}: {blocks} blocos lidos de novo, {bytes} bytes diferentes.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: {blocks} blocos lidos de novo, {bytes} bytes diferentes, {count} bloco não pôde ser lido.',
    many: '{label}: {blocks} blocos lidos de novo, {bytes} bytes diferentes, {count} de blocos não puderam ser lidos.',
    other:
      '{label}: {blocks} blocos lidos de novo, {bytes} bytes diferentes, {count} blocos não puderam ser lidos.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Parado antes da leitura completa da flash: a câmara arrancou a partir de uma ranhura a que esta execução não aplicou o patch, por isso não foi lido nada.',
  'preserve.unpatchedStart.next':
    'A seguir: o restauro repõe todas as ranhuras escritas. A leitura completa não é tentada de novo: a câmara arrancaria a partir da mesma ranhura.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Concluído — o seu firmware está preservado',
  'preserve.done.detail':
    'A imagem completa é toda a flash original da câmara, e a própria câmara voltou a estar exatamente como estava.',
  'preserve.done.titleNoImage':
    'Concluído — a câmara voltou a estar como estava; não há imagem completa',
  'preserve.done.detailNoImage':
    'A leitura completa da flash não foi feita, por isso esta execução não tem uma imagem completa da flash. Todas as ranhuras escritas foram repostas, e uma nova leitura dos blocos a que um dump normal chega corresponde à cópia de segurança. Para obter a imagem completa, inicie uma nova execução com uma escolha que inclua a ranhura do próximo arranque.',
  'preserve.done.detailNoImageCount':
    'A leitura completa da flash não foi feita, por isso esta execução não tem uma imagem completa da flash. Todas as ranhuras escritas foram repostas, e uma nova leitura dos {blocks} blocos a que um dump normal chega corresponde à cópia de segurança. Para obter a imagem completa, inicie uma nova execução com uma escolha que inclua a ranhura do próximo arranque.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'o leitor de janelas da câmara tem um limite por arranque e estas leituras vieram de um leitor esgotado — desligue e volte a ligar a câmara (desconecte-a e volte a conectá-la, ou use o interruptor) e depois execute de novo `preserve --resume <run-directory>`. Assinatura: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'o leitor de janelas da câmara tem um limite por arranque e estas leituras vieram de um leitor esgotado — desligue e volte a ligar a câmara (desconecte-a e volte a conectá-la, ou use o interruptor) e depois execute de novo `preserve --resume <run-directory>`. Assinatura: {signature} — não é possível derivar destes bytes nenhuma imagem de fábrica desencriptada. Foram experimentadas todas as formas de a ler:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'a cópia de segurança não contém {bank:acc} ({address}) — as janelas originais não a conseguem fornecer',
  'preserve.fail.readsDisagree':
    'as duas leituras {bank:gen} não coincidem (sha256 {sha256} vs {other}) — uma câmara que não consegue fornecer duas vezes seguidas a ranhura que executa não é uma câmara em que se deva escrever; a captura é a origem do restauro e a base de que o patch é derivado',
  'preserve.fail.notFactory':
    '{bank:acc} não contém a imagem de fábrica tal como a cifra desta compilação a guarda (o prefixo de imagem esperado não corresponde à captura) — recusado antes de registar o que quer que seja, e muito menos de escrever',
  'preserve.fail.ffSum':
    'o firmware com o patch, na forma em que a câmara o guarda, não passa a verificação desta compilação (a sua soma tem de ser {sum}) — recusado o envio de uma ranhura que a câmara rejeitaria depois de a apagar',
  'preserve.fail.headChanged':
    'o início {bank:gen} mudou desde a cópia de segurança (não contém nem a captura original nem os bytes com o patch) — recusada a escrita sobre um estado desconhecido da ranhura; não foi escrito nada. Hex do início: atual {live} vs captura {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:acc} já contém os bytes com o patch — a escrita foi feita numa tentativa anterior e não pode ser repetida. Retome no passo da leitura completa (--resume), que arranca a imagem com o patch e continua a partir daí.',
  'preserve.fail.landed':
    '{banks:acc} já contêm os bytes com o patch — a escrita foi feita numa tentativa anterior e não pode ser repetida. Retome no passo da leitura completa (--resume), que arranca a imagem com o patch e continua a partir daí.',
  'preserve.fail.drainRebootRefused':
    'o comando de reinício da leitura completa foi RECUSADO pelo anfitrião antes de sair (um SecurityError: uma política do browser ou uma proteção de teste), por isso a câmara continua a executar a imagem com que arrancou, e não o patch confirmado. A leitura completa só lê através da janela alargada da imagem com o patch, por isso para antes de abrir o que quer que seja; não foi lido nada. Execute de novo a leitura completa onde o anfitrião deixe passar o comando de reinício.',
  'preserve.fail.shiftedRebootRefused':
    'a leitura completa voltou deslocada uma página para cima, e o reinício que provoca outro arranque foi RECUSADO pelo anfitrião antes de sair (um SecurityError: uma política do browser ou uma proteção de teste) — outra tentativa leria o mesmo arranque deslocado. Não foi guardado nada; execute de novo a leitura completa onde o reinício possa sair.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'a verificação leu {count} byte diferente em {read}/{total} janelas — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    many: 'a verificação leu {count} de bytes diferentes em {read}/{total} janelas — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    other:
      'a verificação leu {count} bytes diferentes em {read}/{total} janelas — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
  },
  'preserve.fail.verifyIn': {
    one: 'a verificação leu {count} byte diferente em {read}/{total} janelas (em {places}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    many: 'a verificação leu {count} de bytes diferentes em {read}/{total} janelas (em {places}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    other:
      'a verificação leu {count} bytes diferentes em {read}/{total} janelas (em {places}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
  },
  'preserve.fail.verifyShort': {
    one: 'a verificação leu {count} byte diferente em {read}/{total} janelas (janelas incompletas: {short}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    many: 'a verificação leu {count} de bytes diferentes em {read}/{total} janelas (janelas incompletas: {short}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    other:
      'a verificação leu {count} bytes diferentes em {read}/{total} janelas (janelas incompletas: {short}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
  },
  'preserve.fail.verifyInShort': {
    one: 'a verificação leu {count} byte diferente em {read}/{total} janelas (em {places}) (janelas incompletas: {short}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    many: 'a verificação leu {count} de bytes diferentes em {read}/{total} janelas (em {places}) (janelas incompletas: {short}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
    other:
      'a verificação leu {count} bytes diferentes em {read}/{total} janelas (em {places}) (janelas incompletas: {short}) — o chip não volta a ser lido idêntico byte a byte à cópia de segurança',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'o bloco de configuração de arranque',
  'preserve.fail.dataBlock': 'um bloco de dados',

  'preserve.refused.secondRead': 'a segunda leitura falhou ({error})',
  'preserve.refused.readsDisagree': 'as duas leituras não coincidem (sha256 {sha256} vs {other})',
  'preserve.refused.erased': 'está apagada',
  'preserve.refused.watchdogMark':
    'a palavra do cabeçalho em +0x200 contém {word}, a marca que o bootloader escreve numa ranhura depois de um reinício pelo watchdog no início de um arranque; o bootloader já não aceita esta ranhura, e a execução não tem lá nenhuma imagem a que aplicar o patch',
  'preserve.refused.noHeader': 'não contém nenhum cabeçalho de imagem em +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'contém {image} ({id}), não a compilação que a câmara executa ({camera})',
  'preserve.refused.otherKey':
    'a verificação do bootloader recusa-a: está guardada com outra chave que não aquela com que o bootloader desta câmara verifica as ranhuras, e uma escrita através da câmara guardá-la-ia com essa chave, por isso o restauro não conseguiria repor os seus bytes exatos',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'a câmara indica o firmware {camera}, mas é preciso o {version} — o patch é derivado dos bytes de uma compilação e não pode ser enviado para outra',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'o firmware {version} não é uma compilação 0.x ou 1.x, e esta execução só cobre as compilações de 2014 e 2016. Não foi lido nada além da versão. Leia antes esta câmara com «Dump e desencriptação 4.x/Nano»: lê a flash sem patch, todos os blocos exceto o de 0x14060000, a que nenhuma janela de leitura chega nessas compilações.',
  'preserve.refused.preWidening':
    'o firmware {version} é anterior à via de alargamento, e a execução recusa em vez de escrever sobre uma ranhura que não consegue reler. Nesta geração, a câmara rejeita todas as formas de iniciar a leitura de que a via precisa (medido na 0.3.0.1), o seu comando de leitura não chega ao início da flash, e o tamanho que o patch alteraria está guardado de outra forma. Também não tem nenhuma leitura que um dump normal possa usar. Não foi lido nada além da versão.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'contém uma imagem desconhecida (nem o firmware {version} original, nem uma alteração dele que o Preserve conheça), por isso o Preserve não lhe aplica o patch nem a repõe',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'contém uma compilação de taxa de fotogramas conhecida: o firmware {version} original com o patch da taxa de fotogramas de {hz} Hz. O Preserve só aplica o patch ao firmware original, nunca a uma imagem já modificada, por isso não aplica o patch a esta ranhura nem a repõe',
  'preserve.image.frameRateEarlier':
    'contém uma compilação de taxa de fotogramas conhecida: o firmware {version} original com um patch anterior da taxa de fotogramas de {hz} Hz (feito antes de lhe ser juntada a correção do USB). O Preserve só aplica o patch ao firmware original, nunca a uma imagem já modificada, por isso não aplica o patch a esta ranhura nem a repõe',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '{what}. Para incluir esta ranhura, escreva primeiro nela a imagem original (por exemplo, a partir de uma cópia de segurança completa da flash feita antes da alteração) e depois inicie uma nova execução',
  'preserve.image.frameRateWords':
    '{what}. Para incluir esta ranhura, escreva primeiro nela a imagem original (por exemplo, a partir de uma cópia de segurança completa da flash feita antes do patch da taxa de fotogramas) e depois inicie uma nova execução; o patch da taxa de fotogramas pode voltar a ser feito depois sobre a imagem original',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name:ins} {what}. A execução tira desta ranhura o firmware a que aplica o patch, por isso para aqui, antes de escrever o que quer que seja. Para preservar esta câmara, escreva primeiro a imagem original {bank:loc} (por exemplo, a partir de uma cópia de segurança completa da flash feita antes da alteração) e depois inicie uma nova execução.',
  'preserve.image.frameRateRefusal':
    '{name:ins} {what}. A execução tira desta ranhura o firmware a que aplica o patch, por isso para aqui, antes de escrever o que quer que seja. Para preservar esta câmara, escreva primeiro a imagem original {bank:loc} (por exemplo, a partir de uma cópia de segurança completa da flash feita antes do patch da taxa de fotogramas) e depois inicie uma nova execução; o patch da taxa de fotogramas pode voltar a ser feito depois sobre a imagem original.',
  'preserve.image.otherFirmware': 'contém o firmware {image}, não o {camera} que a câmara executa',
  'preserve.image.otherFirmwareRefusal':
    '{name:ins} contém o firmware {image}, não o {camera} que a câmara executa, por isso esta execução não tem lá nenhuma imagem a que possa aplicar o patch e recusa em vez de escrever por cima.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'não se deriva dela nenhuma imagem a que a execução possa aplicar o patch ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone':
    'esta execução está concluída — todos os passos foram feitos (execução {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'o passo {step} já foi feito nesta execução (terminado em {finished}) — a retoma continua em {next}',
  'preserve.gate.stepDoneUnknownTime':
    'o passo {step} já foi feito nesta execução (terminado a uma hora desconhecida) — a retoma continua em {next}',
  'preserve.gate.backupRerun':
    'a cópia de segurança não pode ser repetida: esta execução já concluiu {steps} e o passo seguinte é {next} — use --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'a tentativa anterior de cópia de segurança falhou, e a câmara tem de ser DESLIGADA E VOLTAR A SER LIGADA antes de este passo ser executado de novo — uma nova tentativa no mesmo arranque pode ler bytes antigos ou em branco (medido: uma cópia de segurança repetida leu a palavra de arranque do bootloader em vez do registo de configuração de arranque). Desligue e volte a ligar a câmara (desconecte-a e volte a conectá-la, ou use o interruptor), depois faça de novo a cópia de segurança e confirme, quando lhe for pedido, que a câmara foi desligada e ligada: a execução não consegue ver isso acontecer. A falha registada: {error}',
  'preserve.gate.noErrorText': '(sem texto de erro)',
  'preserve.gate.patchAfterBackup':
    '{step} só pode correr depois da cópia de segurança: a execução faz o dump de todas as regiões que o plano original consegue ler e guarda-o ANTES de acontecer qualquer outra coisa — essa cópia de segurança é a única cópia desta câmara. Faça primeiro o passo da cópia de segurança.',
  'preserve.gate.commitAfterBackup':
    '{step} só pode correr depois da cópia de segurança (veja o passo do patch)',
  'preserve.gate.commitAfterPatch':
    '{step} só pode correr depois do passo do patch, que regista o que prepara',
  'preserve.gate.commitNeedsPatch':
    '{step} precisa do patch {banks:gen}, e o passo do patch não registou nenhum — execute de novo o passo do patch',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} precisa dos ficheiros da cópia de segurança na pasta da execução e eles estão em falta: {files} — sem eles, a escrita não tem origem para o restauro, por isso recusa',
  'preserve.gate.drainNoCommit':
    '{step} lê a parte COM O PATCH através da janela alargada, e esta execução não tem nenhuma escrita concluída — a leitura completa ficaria bloqueada numa câmara sem alterações. Execute primeiro a escrita (ou retome nela), ou salte explicitamente (allowJump) se a escrita foi feita sem o seu ponto de controlo.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'o passo da leitura completa recusa-se a correr em {build}: {note}',
  'preserve.gate.detectedBuild': 'a compilação detetada',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'o passo da leitura completa recusa-se a correr em {build}: iniciar a leitura completa no firmware sem patch desta compilação bloqueia a câmara (lê a partir de um valor que não é um endereço da flash; medido no emulador: foram servidos 32 KB e depois a câmara falhou). A alteração que torna a leitura segura está em {sites}, e não está entre as alterações que esta execução registou para {bank:acc} — execute o passo do patch (e conclua a escrita) antes da leitura completa.',
  'preserve.gate.drainFiles':
    '{step} precisa de {files} (o dump entregue é pós-processado com a captura de cada ranhura escrita) e não está na pasta da execução',
  'preserve.gate.restoreNoCommit':
    '{step} repõe as ranhuras originais por cima do patch, e esta execução não tem nenhuma escrita concluída — não há nada para reverter. Execute primeiro a escrita (ou retome nela), ou salte explicitamente (allowJump) para restaurar uma câmara que já tem o patch.',
  'preserve.gate.restoreNeedsPatch':
    '{step} precisa do resumo do patch de cada ranhura escrita (para o comprimento enviado) — execute primeiro o passo do patch',
  'preserve.gate.restoreNoForm':
    'o passo do restauro recusa-se a correr em {build}: nenhuma forma do firmware original passa a verificação da própria câmara e fica também guardada como os bytes originais — a soma de verificação do firmware original é 0xB7AB9D17 (medido), não o 0xFFFF que a câmara exige. Esta execução termina com a imagem completa em mãos e o patch no lugar; o conteúdo original só pode voltar com um programador da flash completa.',
  'preserve.gate.restoreFiles':
    '{step} precisa de {files} (o original de cada ranhura escrita, do passo da cópia de segurança) e não está na pasta da execução',
  'preserve.gate.verifyNoRestore':
    '{step} compara um arranque novo com a cópia de segurança, e esta execução não tem nenhum restauro concluído — uma ranhura com o patch apareceria como diferenças. Execute primeiro o restauro (ou retome nele), ou salte explicitamente (allowJump) se o restauro foi feito sem o seu ponto de controlo.',
  'preserve.gate.verifyNeedsBackup':
    '{step} precisa de {file} (a referência da comparação) e não está na pasta da execução',
  'preserve.gate.needsBanks':
    '{step} precisa das ranhuras que o passo da cópia de segurança leu, e o estado não tem nenhuma',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'não foi escolhida nenhuma ranhura para esta execução: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:acc} não pode ser escrita: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'o patch desta compilação só arranca a partir da ranhura de recuperação R: {note} — a execução escreveria {bank:acc}, a partir da qual o bootloader nunca o executa',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'o ficheiro é demasiado pequeno para conter um cabeçalho de imagem',
  'slots.image.notWordSized': 'o tamanho da imagem tem de ser múltiplo de 4 (recebido: {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'a imagem tem {size} B; o bootloader rejeita qualquer header.length >= {limit}, por isso nunca arrancaria',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'nenhum cabeçalho de imagem em {at} (número mágico {magic}, esperado {expected}) — tem de ser uma imagem de firmware Seek desencriptada, não uma ranhura encriptada nem um dump da flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'o stack pointer inicial {address} não está na SRAM do LPC43xx — isto não parece desencriptado',
  'slots.image.stackUnaligned': 'o stack pointer inicial {address} não está alinhado a palavras',
  'slots.image.notThumb': 'o vetor de reset {address} não é um endereço Thumb',
  'slots.image.noKeyPair':
    'o nome deste ficheiro não indica o seu par de chaves, e nem o par desta câmara nem um par de aplicação descodificado aparecem na imagem exatamente uma vez, por isso não há forma de saber para que chaves a imagem foi feita. Os ficheiros desencriptados saem com o nome das chaves que contêm.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'o nome do ficheiro indica a chave A {keyA} e a chave B {keyB}, mas {mismatch}. As duas chaves têm de estar presentes, exatamente uma vez cada.',
  'slots.image.keyInHeader':
    'esta imagem guarda uma chave em {at}, dentro da janela do cabeçalho não encriptada — recusada a aplicação do patch',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'a chave A e a chave B do nome do ficheiro correspondem a bytes sobrepostos em {at} e {other} — têm de ser dois valores distintos de 16 bytes',
  'slots.image.retargetLost':
    'depois de adaptada, a imagem não contém o par de chaves desta câmara exatamente uma vez — recusada a criação de dados cujas atualizações posteriores o bootloader não conseguiria desencriptar',
  'slots.image.noStageKey':
    'a imagem não contém nenhum par de chaves da linha de 2016, por isso não há chave de envio com que a codificar',
  'slots.image.ffSumNoKeys':
    'esta imagem tem a soma de palavras FF de 16 Hz, 0xFFFF, mas não contém o par de chaves da 1.3.0.8-FF (as duas metades, uma vez cada), por isso não é possível criar a sua forma preparada. Não foi escrito nada.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'esta é a imagem 1.3.0.8 FF (16 Hz), que é preparada na sua própria forma com a chave A (ff-form.ts), não como imagem simples. Não foi escrito nada.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'o plano foi feito para o firmware {firmware}, mas a análise lê {version}. O plano está desatualizado; faça-o de novo. Não foi escrito nada.',
  'slots.plan.otherFirmwareUnknown':
    'o plano foi feito para um firmware de versão desconhecida, mas a análise lê {version}. O plano está desatualizado; faça-o de novo. Não foi escrito nada.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'o plano foi feito para a câmara {planSerial}, mas a análise lê {serial}. Recusada a escrita aqui. Não foi escrito nada.',
  'slots.plan.cameraUnknownSerial': 'de número de série desconhecido',
  'slots.plan.unknownSerial': 'um número de série desconhecido',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'o plano visa {address}, mas {name:acc} desta compilação está em {at}',
  'slots.plan.notRead': 'a análise já não lê {name:acc}. Não foi escrito nada.',
  'slots.plan.edited':
    'a soma de verificação do plano não corresponde aos seus dados, por isso o plano foi alterado. Não foi escrito nada.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'os dados têm {size} B, mais do que cabe {name:loc}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Escrevê-la precisa de acknowledgeRisk: true. Não foi enviado nada.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'esta câmara não pode receber daqui uma imagem preparada sem encriptação: {reason}. Não foi escrito nada.',
  'slots.plan.noKeyTable':
    'a análise não identifica a tabela de chaves do bootloader desta câmara, por isso não é possível adaptar a imagem a ela',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'não foi possível ler o estado da confirmação depois de CompleteMemoryUpgrade, por isso {name:acc} pode estar parcialmente escrita. Leia as ranhuras de novo antes de fazer qualquer outra coisa, e guarde o seu dump.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'a câmara recusou a escrita {name:loc} na confirmação, com {status}: {cause}. Não foi escrito nada; a ranhura não foi alterada. Leia as ranhuras de novo antes de fazer qualquer outra coisa.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade devolveu {status} ({cause}) para {name:acc}: não foi programado nada, mas o apagamento pode ter começado, por isso a ranhura pode estar parcialmente apagada. Leia as ranhuras de novo antes de fazer qualquer outra coisa, e guarde o seu dump.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade devolveu {status} ({cause}) — {name:acc} pode estar parcialmente escrita. Leia as ranhuras de novo antes de fazer qualquer outra coisa, e guarde o seu dump.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'a câmara indicou {status} durante o envio para {name:acc}, no deslocamento {offset} — interrompido antes de CompleteMemoryUpgrade, por isso não foi escrito nada na flash',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum':
    'a soma de verificação da transferência não correspondeu aos bytes enviados',
  'commit.cause.unsupported':
    'a imagem não se desencriptou com as chaves da câmara, ou o tipo de dados é recusado',
  'commit.cause.acceptance':
    'a imagem foi recusada pela sua verificação de aceitação antes de ser apagado o que quer que seja (a verificação depende da compilação)',
  'commit.cause.notArmed': 'não estava aberta nenhuma atualização de ranhura',
  'commit.cause.eraseFailed': 'a fase de apagamento falhou',
  'commit.cause.programFailed': 'a fase de programação falhou',
  'commit.cause.verifyFailed': 'a fase de verificação falhou',
  'commit.cause.unknown': 'um estado desconhecido aqui',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name:ins} não é copiada para si própria. Não foi escrito nada.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Não foi escrito nada.',
  'copy.refused.noPlain':
    '{name:ins} não tem nenhuma imagem desencriptada para copiar. Não foi escrito nada.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} é um ZIP que não é possível ler aqui ({error}). Não foi escrito nada.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} não contém uma flash completa. Um ZIP é aceite quando é um ficheiro de execução do Preserve que contém {preserve} (depois de o passo do dump completo ter corrido), um zip de «Dump e desencriptação 4.x/Nano» ({dump}) ou um zip de «Dump de todos os seletores» ({selectors}); este ZIP contém {names}. Não foi escrito nada.',
  'restore.refused.noWholeFlashPatched':
    '{file} não contém uma flash completa. Um ZIP é aceite quando é um ficheiro de execução do Preserve que contém {preserve} (depois de o passo do dump completo ter corrido), um zip de «Dump e desencriptação 4.x/Nano» ({dump}) ou um zip de «Dump de todos os seletores» ({selectors}); este ZIP contém {names}. O seu {patched} é a flash com o patch temporário da execução, por isso não é aceite. Não foi escrito nada.',
  'restore.refused.zipEmpty': 'nada',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'uma cópia de segurança completa da flash tem {full} B (4 MB, o chip inteiro que um J-Link lê); {file} tem {size} B. Não foi escrito nada.',
  'restore.refused.noBank': 'o plano desta compilação não tem {bank:acc}. Não foi escrito nada.',
  'restore.refused.outsideFlash':
    '{name:ins} não está dentro de uma flash de 4 MB. Não foi escrito nada.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'A {where} não foi lida pelo dump de onde {file} vem: segundo o seu manifest.json, {address} é uma lacuna. Não há imagem para restaurar. Não foi escrito nada.',
  'restore.refused.gapReason':
    'A {where} não foi lida pelo dump de onde {file} vem: segundo o seu manifest.json, {address} é uma lacuna ({gap}). Não há imagem para restaurar. Não foi escrito nada.',
  'restore.refused.gapFill':
    'A {where} não foi lida pelo dump de onde {file} vem: segundo o seu manifest.json, {address} é uma lacuna, preenchida com {fill}. Não há imagem para restaurar. Não foi escrito nada.',
  'restore.refused.gapReasonFill':
    'A {where} não foi lida pelo dump de onde {file} vem: segundo o seu manifest.json, {address} é uma lacuna ({gap}), preenchida com {fill}. Não há imagem para restaurar. Não foi escrito nada.',
  'restore.refused.empty':
    'A {where} está vazia: todos os bytes são 0xFF. Uma escrita programa uma imagem e não pode deixar uma ranhura apagada, por isso uma ranhura vazia não pode ser restaurada por uma escrita. Não foi escrito nada.',
  'restore.refused.fill':
    'A {where} tem {fill} em todos os bytes, o preenchimento que o dump escreve onde não leu nada: o dump não leu esta ranhura. Não há imagem para restaurar. Não foi escrito nada.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    'A {where} não pode ser restaurada a partir deste ficheiro: {why}. Não foi escrito nada.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'esta compilação não tem abertura de escrita para a ranhura',
  'support.noStagingEmpty':
    'esta compilação não tem forma de preparação, por isso uma ranhura vazia não é escrita',
  'support.buildUnknown': 'a compilação é desconhecida',
  'support.unverifiedStaging':
    'esta compilação está na linha bloqueada 0.x/1.x, mas não é uma das compilações em que as tabelas de patches de preservação foram medidas (0.8.0.0 .. 1.3.0.8 e 1.0.3.0 / 1.0.3.2), por isso a forma de preparação que a sua ranhura aceita é desconhecida e não é escrito nada',
  'support.unknownFamily':
    'a família da câmara não é conhecida, e por isso também não é a chave com que as suas ranhuras são escritas, e uma câmara aceita uma ranhura escrita com a chave errada e depois não arranca a partir dela. Faça o dump desta câmara e desencripte-o, identifique-a a partir do dump e depois indique a sua família com --family.',
  'support.noReadCommand':
    'o firmware anterior a 0.8.0.0 não tem handler de leitura para GetFeaturedFirmwareData, o comando com que um dump lê a flash. Na 0.7.0.7 e na 0.7.0.8, está na tabela de métodos RPC em 0x4F, mas registado só como setter (handler de escrita), por isso a leitura control-IN que um dump envia não pode ser despachada (em vez disso, a execução de preservação lê essas duas compilações através do wire id 0x58, GetFeaturedData); antes da 0.7.0.7, o wire id 0x4F é UploadFirmwareRowSize, e na 0.3.0.1 o wire id 0x52 — aquele com que um dump abre a janela — é EnterBootloaderMode e não BeginFirmwareUpgrade: a câmara fica na sua aplicação, mas cada abertura define um destino na flash e prepara a fase de atualização de firmware dessa compilação (GetErrorCode lê depois 0x00400000), o que não é uma janela de leitura. Recuperado das próprias tabelas de métodos das imagens, nas duas colunas de handlers; veja test/firmware/facts.json.',
  'support.noWritePath':
    'estas compilações recebem firmware novo através de uma sequência de atualização mais antiga que estas ferramentas não enviam, e as suas ranhuras nunca foram mapeadas, por isso não é escrito nada.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'não foi possível ler a versão do firmware, por isso a compilação, as suas ranhuras e a forma de preparação delas são desconhecidas; não se lê nem se escreve nada nela',
  'support.versionNotDotted':
    'a versão de firmware «{version}» não é uma versão com pontos, por isso a compilação, as suas ranhuras e a forma de preparação delas são desconhecidas; não se lê nem se escreve nada nela',
  'support.olderThanFirst':
    'o firmware {version} é anterior a {first}: a sua tabela RPC não tem handler de leitura para GetFeaturedFirmwareData, o comando que uma leitura de ranhura envia, por isso não lhe é enviada nem uma leitura nem uma escrita (early-compact tem os indícios)',
  'support.modernOnLocked':
    'a família modern-4x cobre 2.x, 4.x, 10.x, 42.x e 44.x; {version} está na linha bloqueada 0.x / 1.x, que precisa de legacy-auth ou compact-2016',
  'support.lockedOnModern':
    'a família legacy-auth cobre a linha bloqueada 0.x / 1.x; {version} está na linha moderna, que precisa de modern-4x',
  'support.notCompactPro':
    'a família compact-2016 cobre a linha Compact PRO 1.0.3.x; {version} não está nela',
  'support.earlyCompact':
    'a família early-compact só cobre as compilações anteriores a {first}, e {version} é lida com legacy-auth',
  'support.generic':
    'a família da câmara não está identificada (família generic), por isso a disposição das ranhuras e a forma de preparação são desconhecidas; identifique a câmara antes de ler ou escrever uma ranhura',
  'support.noPlan':
    'não existe plano de ranhuras para a família {family}: a disposição das ranhuras e a forma de preparação não são conhecidas',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'a tabela desta compilação não abre o modo {mode} em {address} no canal simples',
  'support.noArmToken':
    'a tabela desta compilação não abre o modo {mode} em {address} no canal com token',
  'support.windowElsewhere': 'a janela de preservação {bank:gen} está em {at}, não em {address}',
  'support.noDumpWindow':
    'a tabela BeginFirmwareUpgrade desta compilação não tem nenhuma janela em {address} para {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} não suporta {capability}: {reason}',
  'support.capability.dump': 'o dump',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '«Dump de todos os seletores»',
  'support.capability.decrypt': 'a desencriptação',
  'support.capability.deviceInfo': 'a leitura completa do separador Informação',
  'support.capability.flash': 'a escrita de ranhuras',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} em {address} não é legível nesta compilação: a sua tabela de seletores não tem lá nenhuma janela, por isso não foi aberto nada para ela',
  'slots.unread.missing': '{name}: não está na análise da câmara',
  'slots.unread.notRead': '{name}: não foi lida',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Não foi escrito nada.',
  'slots.refused.versionUnknown':
    'a análise não diz qual o firmware que a câmara executa, e os comandos das ranhuras significam coisas diferentes em compilações diferentes. Leia de novo as informações do dispositivo.',
  'slots.refused.versionUnknownWrite':
    'a análise não diz qual o firmware que a câmara executa. Não foi escrito nada.',
  'slots.refused.emptyInput': 'a entrada está vazia',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} — vazia, não pode ser escrita nesta compilação: {reason}',
  'slots.refused.noRaw': '{name} — não pode receber bytes em bruto nesta compilação: {reason}',
  'slots.refused.noPlain':
    '{name} — não pode receber uma imagem desencriptada nesta compilação: {reason}',
  'slots.refused.noStaging':
    '{name} — não tem forma de preparação nesta compilação, por isso não é possível codificar uma imagem para ela',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B — mais do que o tamanho da ranhura ({name}: {bankSize} B)',
  'slots.refused.imageTooLong':
    'a imagem tem {size} B, mais do que o tamanho da ranhura ({name}: {bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'o bootloader de 2014 não aceita a soma de verificação desta compilação na ranhura A nem na B, e arranca a ranhura de recuperação R (0x14070000) sem a verificar, por isso o patch é escrito na ranhura de recuperação R e em mais lado nenhum',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly':
    'esta compilação só arranca a partir da ranhura de recuperação R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'uma ranhura de firmware tem {size} B ({kib} KB); este ficheiro tem {count} B',
  'decryptFile.erasedBank':
    'vazia, nada para desencriptar: todos os {size} B se leem como 0xFF (uma ranhura apagada)',
  'decryptFile.erasedHeader':
    'apagada: a janela do cabeçalho é toda 0xFF, por isso a ranhura não contém imagem; não é desencriptado nada',
  'decryptFile.noHeader':
    'nenhum cabeçalho de imagem (número mágico {magic}), por isso não há imagem para desencriptar',
  'decryptFile.lengthOutOfRange':
    'header.length {length} está fora do intervalo; não há imagem para desencriptar',
  'decryptFile.ffKeyB':
    'desencriptados {size} B com a chave B da FF 1.3.0.8: a imagem está guardada como a imagem XOR o fluxo de chave do seu bloco de chaves 1, com a janela do cabeçalho inalterada',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'chave não recuperada: a imagem desencripta-se num vetor de reset que não é um ponto de entrada Cortex-M (chave {check}); não é desencriptado nada',
  'decryptFile.storedPlain':
    'guardada sem encriptação: a ranhura contém a imagem tal como funciona (a cadeia sem encriptação de 2014, um fluxo de chave identidade), por isso não há chave e a imagem desencriptada é a própria imagem',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'desencriptados {size} B com a chave recuperada desta ranhura ({check})',
  'decryptFile.decryptedNamed':
    'desencriptados {size} B com a chave recuperada desta ranhura ({check}; é {key:acc})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'leitura incompleta ({size} B)',
  'read.reason.noParse': 'não foi possível interpretar um cabeçalho de imagem',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'nenhum cabeçalho de imagem (número mágico {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} está fora do intervalo',
  'read.reason.stopped': 'a leitura da ranhura parou em {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'não legível no firmware {version}: o seu plano ({table}) não tem nenhuma janela em {address}, por isso não foi aberto nada para ela',
  'read.reason.notInPlanUnknown':
    'não legível em firmware de versão desconhecida: o seu plano ({table}) não tem nenhuma janela em {address}, por isso não foi aberto nada para ela',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'a janela forneceu os bytes de um descritor de leitor antigo — a palavra 0 {word} com reset {hex} é a tabela de vetores de 0x14000000, não o conteúdo desta ranhura, por isso não foi analisado nada a partir dela: {remedy}',
  'read.reason.spentReader': 'não foi possível ler as ranhuras da câmara — {remedy}',
  'read.spentRemedy':
    'o leitor de janelas pode estar esgotado neste arranque; desligue e volte a ligar a câmara e tente de novo',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'não foi possível ler a palavra de ranhura ativa da câmara (fw info roots, seletor 10)',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'a palavra de ranhura ativa da câmara é {word}, que não corresponde a nenhuma ranhura',
  'checkKey.unnamed.cfg0NotRead':
    'a palavra de configuração de arranque não foi lida, por isso não se sabe se o bootloader verificou {bank:acc} antes de entrar nela',
  'checkKey.unnamed.noZeroSum':
    'a câmara indica que entrou {bank:loc}, mas {bank:acc} não se desencripta numa soma de palavras zero nesta leitura',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'a câmara indica que entrou {bank:loc}, que a palavra de configuração de arranque {word} deixa para último, por isso o bootloader entrou nela sem a verificar, mas {bank:acc} não se desencripta numa soma de palavras zero nesta leitura',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (pontuação {score} depois da leitura, com base nos indícios abaixo)',
  'report.detectedAmbiguous':
    '{family} (pontuação {score} depois da leitura, com base nos indícios abaixo; ambígua)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'sim',
  'report.cell.no': 'não',
  'report.cell.notApplicable': 'n/a',
  'report.cell.unknown': 'desconhecido',
  'report.cell.recoveryOnly': 'só recuperação',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'K de whitening',
  'report.keyRow.store': 'chave de armazenamento',
  'report.keyRow.check': 'chave de verificação',
  'report.keyRow.table': 'tabela de chaves',
  'report.keyRow.keys': 'chaves',
  'report.keyRow.a': 'chave A',
  'report.keyRow.b': 'chave B',
  'report.keyRow.tableAt': 'tabela em',
  'report.key.notIdentified': '(não identificada)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} candidata, nenhuma confirmada',
    many: '{count} de candidatas, nenhuma confirmada',
    other: '{count} candidatas, nenhuma confirmada',
  },
  'report.key.tableAt': '{offset} no bloco do bootloader, confirmada com uma ranhura',
  'report.key.plainChain':
    'nenhuma necessária: as ranhuras estão guardadas como firmware sem encriptação, por isso uma ranhura é lida e escrita tal como está',
  'report.key.tableRefused2016':
    'não lida — o bloco do bootloader (0x14000000) é recusado em todos os canais nesta linha',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, identificada a partir {bank:gen}, a ranhura em que a câmara indica ter entrado depois da verificação do bootloader',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, deduzida a partir {bank:gen}, a ranhura em que a câmara indica ter entrado: o bootloader entra nessa ranhura sem a verificar, e executa-a com a chave com que verifica as outras ranhuras',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (bloco 1 do {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'par Compact PRO 1.0.3.x de 9 Hz',
  'keyPair.cp1032ff': 'par Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'não identificada — {why}',
  'report.checkKey.couldNotName': 'a leitura não a conseguiu identificar',
  'report.storeKey.checkKeyUnnamed':
    'a chave com que o bootloader verifica uma ranhura (não identificada nesta leitura): a aplicação guarda com essa chave cada ranhura que escreve',
  'report.storeKey.checkKey':
    '{key}: a aplicação guarda cada ranhura que escreve com a chave que o bootloader verifica',
  'report.storeKey.unknown':
    'desconhecida — o bloco do bootloader com a posição da chave própria do dispositivo não foi lido',
  'report.storeKey.keyBUnidentified':
    'Chave B (sem chave própria do dispositivo programada; a própria chave B não foi identificada)',
  'report.storeKey.keyB': 'Chave B (sem chave própria do dispositivo programada)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'preparada sem encriptação (a imagem tal como está, sem chave)',
  'report.staged.slotKeystream': 'preparada com o bloco de chaves 0 da própria imagem',
  'report.staged.keyA':
    'preparada com chaves derivadas da ranhura de arranque e da aplicação em execução',
  'report.staged.ffVendor':
    'preparada como a aplicação do fabricante prepara a imagem FF de 16 Hz (a imagem XOR o seu próprio bloco de chaves 0), e guardada pela câmara com a chave B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Cópia de segurança: bloco {address}',
  'progress.backupDone': 'Cópia de segurança: todos os blocos lidos',
  'progress.checkBlock': 'Verificação: bloco {address}',
  'progress.checkDone': 'Verificação: todos os blocos lidos',
  'progress.writingBank': 'A escrever {bank:acc}',
  'progress.restoringBank': 'A restaurar {bank:acc}',
  'progress.staged': '{label}: enviados {done}/{total} B',
  'progress.wholeFlash': 'Leitura completa: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'leitura de {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'leitura de {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Concluído — {ok}/{total} janelas lidas.',
  'progress.readingBank': 'A ler {bank:acc} ...',
  'progress.analysing': 'A analisar ...',
  'progress.probeSelector': 'a sondar o seletor {selector} ...',
  'progress.selectorsArmed': 'Concluído — {armed}/{span} seletores abertos, {withData} com dados.',
  'progress.recoveringKey': 'desencriptação: a recuperar a chave de {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) não pôde ser lida: {error}',
  'slots.read.refusedBuild':
    'recusada a leitura das ranhuras de firmware: {reason}. Não foi enviado nada além da leitura da versão, por isso nenhuma ranhura foi tocada.',
  'slots.backup.notSaved':
    'a cópia de segurança {file} não foi guardada, por isso não foi escrito nada. Uma escrita nunca corre sem a sua cópia de segurança guardada primeiro; tente de novo quando ela puder ser guardada.',
  'slots.backup.notSavedWhy':
    'a cópia de segurança {file} não foi guardada ({error}), por isso não foi escrito nada. Uma escrita nunca corre sem a sua cópia de segurança guardada primeiro; tente de novo quando ela puder ser guardada.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'alta velocidade (480 Mbit/s)',
  'usb.speed.full': 'velocidade total (12 Mbit/s)',
  'usb.speed.code': 'código {code}',
} satisfies Translation<'core'>;
