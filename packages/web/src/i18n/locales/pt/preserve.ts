/**
 * Namespace `preserve`, português europeu (pt), translated from the English source: the "Dump & decrypt 0.x/1.x 2014/2016" tab, a guided run that
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
  'how.title': 'O que esperar',
  'how.descriptionIdle': 'Conecte a câmara e comece no passo 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Execução {runId}.',
  'how.descriptionRunVersion': 'Execução {runId} — firmware {version}.',
  'how.restarts':
    'A câmara **reinicia** durante cada passo. Depois de reiniciar, o Chrome deixa de a reconhecer (não tem número de série USB), por isso a página pede-lhe que prima **Conectar dispositivo** e escolha de novo a câmara. É o funcionamento normal — o passo continua sozinho assim que o fizer.',
  'how.noFile': 'Não há nenhum ficheiro de firmware para escolher: tudo é lido da própria câmara.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'A câmara guarda o firmware em três **ranhuras** ({a}, {b} e {r}). O passo 02 lê as três e determina a partir de qual a câmara vai arrancar a seguir; o patch só funciona se estiver nessa ranhura. Pode escolher as ranhuras a que o passo 03 aplica o patch — por predefinição, a do próximo arranque —, e o passo 04 repõe todas elas.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Depois de cada passo, o browser transfere um **ficheiro de execução** com o nome do início da execução, a hora a que foi guardado e o passo a que chegou (`{example}`), com uma pasta por passo lá dentro. Guarde o mais recente — permite-lhe continuar mais tarde.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Os passos 03 e 04 escrevem na memória flash da câmara**, e cada um pede-lhe confirmação antes. Enquanto um deles decorre, mantenha a câmara conectada (a menos que a página lhe peça para a desconectar e voltar a conectar) e o computador sem entrar em suspensão, de preferência ligado à corrente. Uma escrita interrompida deixa uma câmara que só um programador de hardware (SPI ou SWD/J-Link) consegue reparar.',
  'how.phone':
    '**Num telemóvel:** antes do passo 03, ative o modo de avião e desligue o Wi-Fi e os dados móveis, para que uma chamada ou uma notificação não tire o browser do ecrã a meio da escrita — e mantenha o ecrã ligado. Depois de aberta, a página continua a funcionar offline.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**A escrita não está registada nesta execução, por isso os passos seguintes estão bloqueados.** A câmara pode já estar a executar a imagem com o patch (uma escrita interrompida) ou não (a escrita nunca começou) — o ficheiro de execução não consegue provar qual das duas. Não faça a leitura completa da flash nem o restauro numa câmara com o patch sem a escrita registada; o caminho a seguir é o passo 03, cuja verificação antes da escrita lê a ranhura e se recusa a escrevê-la de novo às cegas. Só se essa verificação já tiver recusado com *already holds the patched bytes* é que o salto se aplica — e passa pela sua própria janela de confirmação.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Leitura e preparação',
  'phase.readBuild.inSentence': 'a leitura e a preparação',
  'phase.readBuild.description':
    'Lê tudo o que uma câmara sem alterações deixa ler — 31 blocos de 64 KB — e guarda-o como a sua cópia de segurança, lê cada ranhura de firmware uma segunda vez, determina a partir de qual ranhura a câmara vai arrancar da próxima vez e prepara o pequeno patch que o passo seguinte escreve. Não é escrito nada na câmara. Normalmente demora menos de um minuto. Se a câmara precisar de reiniciar pelo caminho, a página pede-lhe que prima «Conectar dispositivo» e a escolha de novo — isso é esperado.',
  'phase.patchDump.label': 'Escrita e leitura completa',
  'phase.patchDump.inSentence': 'a escrita e a leitura completa',
  'phase.patchDump.description':
    'Escreve um pequeno patch temporário nas ranhuras de firmware escolhidas no passo 02 (por predefinição, a ranhura do próximo arranque), para conseguir ler toda a memória flash. Depois a câmara reinicia — prima «Conectar dispositivo» e escolha-a de novo quando a página pedir — e é lida toda a flash de 4 MB. O passo 04 repõe o firmware original.',
  'phase.restoreVerify.label': 'Restauro e verificação',
  'phase.restoreVerify.inSentence': 'o restauro e a verificação',
  'phase.restoreVerify.description':
    'Volta a escrever o seu firmware original, reinicia a câmara (prima «Conectar dispositivo» e escolha-a de novo quando for pedido) e depois lê tudo mais uma vez para verificar que corresponde à cópia de segurança byte a byte.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Lê os 31 blocos de 64 KB que uma câmara sem alterações deixa ler, depois lê cada ranhura uma segunda vez (as duas leituras têm de coincidir byte a byte), extrai o firmware de cada ranhura do que a câmara guarda (desencriptado, quando está guardado encriptado) e verifica-o, e determina a partir de qual ranhura a câmara vai arrancar a seguir. Esta é a única cópia desta câmara na execução, feita antes de qualquer escrita.',
  'step.patch.description':
    'Offline, sem câmara. Prepara o patch para cada ranhura que a execução pode escrever: o patch permite que a leitura da câmara chegue a toda a flash de 4 MB, e é escrito na forma em que a câmara o guarda, para que só mudem os bytes do próprio patch.',
  'step.commit.description':
    'A escrita. Primeiro relê cada ranhura escolhida e não escreve nada a menos que cada uma ainda contenha o que a cópia de segurança registou (uma escrita que já foi feita nunca é repetida); depois escreve cada uma, e a ranhura que a câmara experimenta primeiro fica para o fim. A câmara não é reiniciada aqui: é o passo seguinte que a reinicia.',
  'step.drain.description':
    'Reinicia a câmara para que arranque o firmware com o patch (fica em silêncio cerca de dez segundos; a página espera e volta a encontrá-la), verifica a partir de qual ranhura arrancou (uma ranhura sem o patch interrompe o passo antes de qualquer leitura), depois lê toda a flash de 4 MB numa só leitura e coloca na imagem guardada o firmware original de cada ranhura escrita, tirado da cópia de segurança. Não é escrito nada.',
  'step.restore.description':
    'A outra escrita. Volta a escrever o firmware original de cada ranhura escrita enquanto o firmware com o patch ainda está a funcionar, e depois reinicia a câmara.',
  'step.verify.description':
    'Depois de um arranque novo, lê de novo os 31 blocos, incluindo todas as ranhuras: 0 bytes diferentes provam que a flash da câmara é idêntica byte a byte à cópia de segurança. Só leitura.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Iniciar {phase}',
  'phase.retry': 'Repetir {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Avançar para o passo 04: restaurar as ranhuras',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Avançar além da escrita não registada',
  'phase.skipWrite': 'Saltar a escrita — começar na leitura completa',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Ações: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'escreve na câmara',
  'badge.running': 'Em curso',
  'badge.done': 'Concluído',
  'badge.plannedStop': 'Parado como previsto — segue-se o restauro',
  'badge.failed': 'Parado — veja o registo',
  /** A badge on the step that runs next. */
  'badge.upNext': 'A seguir',
  /* Why the start button is off. */
  'notReady.noRun': 'Disponível depois do passo 02 — é ele que inicia a execução.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Disponível depois do passo {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Ainda não está pronto — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Diz respeito à câmara com o patch enquanto a escrita não está registada — a câmara pode já ter o patch. Veja a nota em «{section}».',
  'phase.noDrain':
    'A leitura completa da flash não foi feita — este passo repõe a câmara sem ela. Execute primeiro o passo 03, a menos que a leitura completa não lhe interesse.',
  'phase.keepPlugged':
    'Mantenha a câmara conectada e o computador sem entrar em suspensão até este passo terminar.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Progresso',
  'phase.showDetails': 'Mostrar detalhes no registo',
  'phase.inDetail': 'O que este passo faz, em pormenor',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'É a sua vez',
  'yourTurn.reconnect.title': 'É a sua vez: prima «Conectar dispositivo» e escolha a câmara.',
  'yourTurn.reconnect.body':
    'A câmara reiniciou, como previsto. O Chrome não a consegue reconhecer de novo sozinho (não tem número de série USB), por isso precisa que a escolha mais uma vez. O passo continua assim que o fizer.',
  'yourTurn.replug.title':
    'É a sua vez: desconecte a câmara, volte a conectá-la e depois prima «Conectar dispositivo».',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'O patch desta execução foi feito antes da correção da leitura, por isso a câmara precisa de ser desligada e voltar a ser ligada antes do restauro. O ficheiro de execução já está guardado.',
  'yourTurn.replugBeforeRestore.title':
    'Antes do passo 04: desconecte a câmara, volte a conectá-la e depois prima «Conectar dispositivo».',
  'yourTurn.powerCycle.title':
    'É a sua vez: desconecte a câmara, volte a conectá-la, prima «Conectar dispositivo» — e depois tente de novo.',
  'yourTurn.powerCycle.body':
    'A leitura da câmara precisa que ela seja desligada e voltar a ser ligada antes de poder ser lida outra vez. A execução continua carregada aqui; não se perde nada.',
  'yourTurn.powerCycleAssert.title':
    'É a sua vez: desconecte a câmara, volte a conectá-la, prima «Conectar dispositivo» — e depois continue.',
  'yourTurn.powerCycleAssert.body':
    'A última tentativa de cópia de segurança parou, e a câmara precisa de ser desligada e voltar a ser ligada antes de a repetir. A câmara não o consegue indicar sozinha, por isso o botão abaixo informa a página de que o fez.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Já desconectei e voltei a conectar — continuar {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'A que ranhuras o passo 03 aplica o patch',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Palavra de configuração de arranque',
  'banks.lastStart': 'Último arranque',
  'banks.nextStart': 'Próximo arranque',
  'banks.caption': 'As três ranhuras de firmware, tal como o passo 02 as leu',
  'banks.col.bank': 'Ranhura',
  'banks.col.address': 'Endereço',
  'banks.col.holds': 'O que contém',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'próximo arranque',
  'banks.choiceLabel': 'Ranhuras para o patch',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'A ranhura do próximo arranque',
  'choice.all': 'Todas as ranhuras',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — indisponível',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen':
    'Ainda não foi escolhida nenhuma ranhura: {what}. Escolha uma ranhura pelo nome acima.',
  'banks.writes': 'O passo 03 escreve {what}.',
  'banks.fixed':
    'A escrita já foi feita, por isso a escolha está fixada: o passo 04 repõe exatamente estas ranhuras.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: indisponível — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'não há nenhuma execução ativa — o passo 02 inicia uma',
  'banks.refusedBusy': 'há um passo em curso — escolha as ranhuras quando terminar',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'O plano — {build}, patch {banks:loc}',
  'plan.summaryNone': 'O plano — {build}, ainda sem ranhura escolhida',
  'plan.yourCamera': 'a sua câmara',
  'plan.intro':
    'Gerado a partir dos próprios bytes da câmara. Não é escrito nada até o passo 03 ser executado, e o passo 04 repõe todos os bytes que ele escreve.',
  /* The rows; their values are core's. */
  'plan.build': 'Compilação',
  'plan.version': 'Versão do firmware',
  'plan.written': 'Escrito',
  'plan.route': 'Para onde vai',
  'plan.restore': 'Restauro',
  'plan.wholeFlash': 'Leitura completa da flash',
  'plan.outro':
    'Na forma que a câmara guarda, mudam os mesmos bytes e nenhuns outros, por isso o firmware da câmara muda exatamente nesta diferença e em mais nada.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'O patch {bank:gen}',
  'bankPlan.titleChosen': '{bank} — escrita por esta execução',
  'bankPlan.titleNotChosen': '{bank} — não escolhida',
  'bankPlan.source': 'Origem da imagem',
  'bankPlan.sourceValue': '{bank:acc} tal como está guardada',
  'bankPlan.sourceTwoReads':
    '{bank:acc} tal como está guardada, duas leituras coincidentes (sha256 {sha})',
  'bankPlan.edit': 'Alteração da imagem',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) sobre a imagem de fábrica. A sua compensação, {balance}, está na palavra de ajuste; o patch compensa por cima dela, e o passo 04 repõe a imagem com essa alteração.',
  'bankPlan.factorySha': 'sha256 de fábrica (desencriptado)',
  'bankPlan.patchedSha': 'sha256 com o patch',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Bytes alterados no chip flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Comprimento enviado',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B em {count} bloco',
    many: '{size} B em {count} de blocos',
    other: '{size} B em {count} blocos',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Palavra de compensação',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (era {balance}, a compensação da alteração)',
  'bankPlan.caption': 'Os bytes exatos que o patch altera {bank:loc}',
  'bankPlan.col.what': 'O que altera',
  'bankPlan.col.offset': 'Deslocamento',
  'bankPlan.col.before': 'Antes',
  'bankPlan.col.after': 'Depois',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Verificado — correspondência perfeita.** Depois de um arranque novo, a câmara foi lida de novo: {read}/31 blocos, {count} byte diferente. A flash está exatamente como estava antes da primeira escrita.',
    many: '**Verificado — correspondência perfeita.** Depois de um arranque novo, a câmara foi lida de novo: {read}/31 blocos, {count} de bytes diferentes. A flash está exatamente como estava antes da primeira escrita.',
    other:
      '**Verificado — correspondência perfeita.** Depois de um arranque novo, a câmara foi lida de novo: {read}/31 blocos, {count} bytes diferentes. A flash está exatamente como estava antes da primeira escrita.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Verificado — correspondência perfeita.** Depois de um arranque novo, a câmara foi lida de novo: {read}/31 blocos, {count} byte diferente (blocos incompletos: {blocks}). A flash está exatamente como estava antes da primeira escrita.',
    many: '**Verificado — correspondência perfeita.** Depois de um arranque novo, a câmara foi lida de novo: {read}/31 blocos, {count} de bytes diferentes (blocos incompletos: {blocks}). A flash está exatamente como estava antes da primeira escrita.',
    other:
      '**Verificado — correspondência perfeita.** Depois de um arranque novo, a câmara foi lida de novo: {read}/31 blocos, {count} bytes diferentes (blocos incompletos: {blocks}). A flash está exatamente como estava antes da primeira escrita.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed':
    '**A verificação encontrou diferenças em relação à cópia de segurança.** {error}',
  unknownReason: 'motivo desconhecido',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — escrever {banks:acc}?',
  'confirm.titleJump': '{phase} — avançar além da escrita não registada?',
  'confirm.chosenBanks': 'as ranhuras escolhidas',
  'confirm.jump':
    'A ESCRITA NÃO ESTÁ REGISTADA nesta execução, e está a afirmar que as escritas foram feitas sem os respetivos pontos de controlo: o passo começa depois da escrita em vez de escrever de novo. As verificações do próprio passo continuam a ser feitas — a leitura da versão, as verificações das ranhuras — e um palpite errado custa uma leitura completa desperdiçada, não uma câmara inutilizada.',
  'confirm.jumpKeepPlugged':
    'Mantenha a câmara conectada e o computador sem entrar em suspensão até o passo terminar.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Isto escreve um pequeno patch {banks:loc}. O passo 04 repõe os originais. A leitura completa que se segue apenas lê.',
  'confirm.patchInOrder':
    'Isto escreve um pequeno patch {banks:loc}, por essa ordem — a ranhura que a câmara experimenta primeiro fica para o fim. O passo 04 repõe os originais. A leitura completa que se segue apenas lê.',
  /* Step 04. */
  'confirm.restore': 'Isto volta a escrever o seu firmware original {banks:loc}.',
  'confirm.restoreInOrder':
    'Isto volta a escrever o seu firmware original {banks:loc}, por essa ordem — a ranhura que a câmara experimenta primeiro vai primeiro.',
  'confirm.keepPlugged':
    'Mantenha a câmara conectada e o computador sem entrar em suspensão enquanto escreve — uma escrita interrompida deixa uma câmara que só um programador de hardware (SPI ou SWD/J-Link) consegue reparar. Num telemóvel: modo de avião ativado e ecrã sempre ligado. Depois a câmara reinicia; quando a página pedir, prima «Conectar dispositivo» e escolha-a de novo. Isso é esperado.',
  'confirm.yesJump': 'Sim — avançar além da escrita',
  'confirm.yesWrite': 'Sim — escrever na câmara',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'A prova',
  'summary.complete': 'Imagem completa (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'não produzida',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'difere da cópia de segurança em {differing} de {count} bloco: {blocks}',
    many: 'difere da cópia de segurança em {differing} de {count} de blocos: {blocks}',
    other: 'difere da cópia de segurança em {differing} de {count} blocos: {blocks}',
  },
  'summary.matches': {
    one: 'corresponde à cópia de segurança ({count} bloco)',
    many: 'corresponde à cópia de segurança (todos os {count} de blocos)',
    other: 'corresponde à cópia de segurança (todos os {count} blocos)',
  },
  'summary.onlyInFull': 'Só na leitura completa',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} bloco que uma leitura normal não alcança: {blocks}',
    many: '{count} de blocos que uma leitura normal não alcança: {blocks}',
    other: '{count} blocos que uma leitura normal não alcança: {blocks}',
  },
  'summary.rawDump': 'Leitura completa, tal como lida',
  'summary.rawDumpBadge': 'igual, mas ainda com o patch',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Imagem de firmware (desencriptada, {bank})',
  'summary.verify': 'Verificação',
  'summary.toolbar': 'Ações do arquivo',
  'summary.download': 'Transferir o arquivo completo (ficheiro de execução)',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Opcional — para continuar uma execução mais tarde',
  'runFile.title': 'Ficheiro de execução',
  'runFile.description':
    'O único registo da execução. É transferido sozinho depois de cada passo (e depois de um passo que tenha parado antes do fim); guarde o mais recente. Para continuar mais tarde, ou depois de um problema, carregue-o aqui e a página retoma onde ficou.',
  'runFile.run': 'Execução',
  'runFile.file': 'Ficheiro',
  'runFile.lastSaved': 'Guardado pela última vez',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'depois de {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Passo seguinte',
  'runFile.none':
    'Não há nenhuma execução ativa. O passo 02 inicia uma, ou carregue aqui um ficheiro de execução.',
  'runFile.toolbar': 'Ações do ficheiro de execução',
  'runFile.load': 'Carregar um ficheiro de execução…',
  'runFile.save': 'Guardar de novo o ficheiro de execução',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Retomar',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nenhum ficheiro de execução escolhido.',
  'status.notRun': 'Ainda não executado.',
  'status.running': 'Em curso …',
  'status.runningRestarts': 'Em curso — a câmara reinicia durante este passo …',
  'status.restarting': 'A câmara está a reiniciar — demora cerca de dez segundos …',
  'status.waitConnect': 'À sua espera — prima «Conectar dispositivo» e escolha a câmara …',
  'status.waitPlugBack':
    'À sua espera — volte a conectar a câmara e depois prima «Conectar dispositivo» …',
  'status.waitReplug': 'À sua espera — desconecte a câmara e volte a conectá-la …',
  'status.back': 'A câmara voltou — a continuar …',
  'status.swapped': 'Parado — a câmara mudou. Verifique-a e depois execute a fase de novo.',
  'status.noRun': 'Sem execução.',
  'status.notCreated': 'Não criada — veja o registo acima.',
  'status.refused': 'Recusado — a lista de fases acima indica o que falta.',
  /* {phase} is phase.*.label. */
  'status.done':
    '{phase} — concluído. O ficheiro de execução nas suas transferências está atualizado.',
  'status.doneReplug':
    '{phase} — concluído, e o ficheiro de execução está guardado. Antes do restauro: desconecte a câmara, volte a conectá-la e prima «Conectar dispositivo».',
  'status.backupRefused': 'Recusado — não foi escrito nada. Veja o registo acima.',
  'status.failed': 'Falhou — veja o registo acima.',
  'status.cancelled':
    'Cancelado — o ficheiro de execução continua a indicar onde a execução parou.',
  'status.readingFile': 'A ler o ficheiro de execução …',
  'status.doneEarlier': 'Concluído antes — carregado do ficheiro de execução.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Falhou antes: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Retomado em {step}. A lista de fases continua a partir daí.',
  'status.notResumed': 'Não retomado — veja o registo acima.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'falta: {missing}',
  'gate.noRun': 'nenhuma execução ativa — a primeira fase cria a execução',
  'gate.runDone': 'esta execução está concluída — todas as fases foram feitas',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'já concluído — a retoma continua em {step}',
  'gate.banksRead': 'as ranhuras que a cópia de segurança lê',
  'gate.choice': 'uma escolha de ranhuras — {why}',
  'gate.bankRefused': '{bank:acc} não pode ser escrita: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'a via da ranhura de recuperação (esta compilação só funciona a partir {r:gen}, não {bank:gen})',
  'gate.backupFirst': 'a cópia de segurança da flash (é feita primeiro nesta fase)',
  'gate.backup': 'a cópia de segurança da flash',
  'gate.patchStep': 'o passo do patch',
  'gate.patchOf': 'o patch {bank:gen}',
  'gate.backupFile': 'o ficheiro das janelas da cópia de segurança',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'a captura {bank:gen}',
  'gate.derived': 'a imagem derivada {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'o passo Escrita (execute-o ou retome nele primeiro)',
  'gate.drainRefused': 'a leitura completa é recusada em {build} — {why}',
  'gate.patchSummary': 'o resumo do patch {bank:gen} (o comprimento enviado)',
  'gate.restoreRefused':
    'o restauro é recusado em {build} — nenhuma forma do firmware original volta a ficar guardada como os bytes originais; a execução termina com a imagem completa e o patch no lugar',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    'a imagem de fábrica desencriptada {bank:gen} ({file}, do passo da cópia de segurança)',
  'gate.restoreFirst': 'o restauro (é feito primeiro nesta fase)',
  'gate.powerCycle':
    'a confirmação de que a câmara foi desligada e voltou a ser ligada — desligue e volte a ligar a câmara (desconecte-a e volte a conectá-la, ou use o interruptor) e depois use o botão para executar de novo',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'a câmara não voltou depois de {minutes} min de tentativas: {error} — se o Chrome não perguntou nada, desconecte a câmara, volte a conectá-la e execute a fase de novo; se o registo disse para a voltar a conectar, era do clique em «Conectar dispositivo» que estava à espera',
} satisfies Translation<'preserve'>;
