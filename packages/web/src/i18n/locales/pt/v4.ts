/**
 * Namespace `v4`, português europeu (pt), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'A iniciar...',
  'status.building': 'A criar o arquivo...',
  'status.cancelling': 'A cancelar — vai guardar o que já foi lido...',
  'status.refused': 'Recusado — não foi lido nada. Veja a mensagem acima do registo.',
  'status.sweepDone':
    'Concluído — {armed}/{total} seletores abertos, {withData} com dados. Veja as suas transferências.',
  'status.sweepDoneCancelled':
    'Concluído — {armed}/{total} seletores abertos, {withData} com dados (cancelado). Veja as suas transferências.',
  'status.dumpDone': 'Concluído — {read}/{expected} janelas lidas. Veja as suas transferências.',
  'status.dumpDoneCancelled':
    'Concluído — {read}/{expected} janelas lidas (cancelado). Veja as suas transferências.',
  'status.dumpDoneIncomplete':
    'Concluído — {read}/{expected} janelas lidas (incompleto — veja o registo). Veja as suas transferências.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'A câmara não correspondeu à família 4.x/Nano, e este separador só lê essa família. Não foi lido nada. Para uma câmara 0.x ou 1.x (compilações de 2014 ou 2016), use «{tab}».',
  'refusal.otherFamily':
    'A câmara parece ser {name} ({id}), não uma câmara 4.x/Nano, e este separador só lê 4.x/Nano. Não foi lido nada. Para uma câmara 0.x ou 1.x (compilações de 2014 ou 2016), use «{tab}».',
  'refusal.legacyLine':
    'A câmara executa {version}, uma compilação 0.x ou 1.x (2014 ou 2016), e este separador só lê 4.x/Nano. Não foi lido nada além da versão. Para uma câmara 0.x ou 1.x, use «{tab}».',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Dump',
  'dump.actions': 'Ações de dump',
  'dump.start': 'Iniciar dump',
  'dump.panel': 'Dump',
  'dump.how':
    'Ambos perguntam primeiro à câmara qual o firmware que executa: a versão, com `{getInfo}` — a única leitura a que todas as compilações Seek respondem da mesma forma — e, só se essa compilação puder ser lida por USB, um `{begin}` simples, outro com token e uma única leitura. É assim que a página sabe qual é a família da câmara. Este separador só lê a família 4.x e Nano. Uma câmara que as respostas coloquem noutra família é recusada antes de qualquer leitura, e a página indica o separador para ela. Uma câmara que não indique a versão, ou que execute uma compilação anterior a 0.8.0.0, não é lida de todo, e a página explica porquê.',
  'dump.modes':
    '**Iniciar dump** lê todos os blocos a que chega a tabela de seletores da própria compilação. **Dump de todos os seletores**, em *Opções* abaixo, experimenta todos os seletores `{begin}` de `{first}` a `{last}` e guarda o que cada um devolver — é mais lento, mas também apanha blocos que o mapa preparado ignora.',
  'dump.sweep': 'Dump de todos os seletores ({first}–{last})',
  'dump.sweepNote':
    'Experimenta todos os seletores e guarda o que cada um devolver. Mais lento do que «Iniciar dump».',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'O que obtém',
  'output.intro': 'Uma única transferência `{ext}` que contém:',
  'output.caption': 'Ficheiros dentro do arquivo transferido',
  'output.file': 'Ficheiro',
  'output.what': 'O que é',
  'output.flash':
    'a imagem completa de 4 MB da flash (o preenchimento da lacuna e o token de desbloqueio, se tiver sido usado, estão em manifest.json)',
  'output.windows': 'cada bloco de 64 KB exatamente como veio da câmara',
  'output.decrypted':
    'cada ranhura com imagem de firmware, desencriptada (se tiver sido encontrada uma chave)',
  'output.reports':
    'relatório por ranhura: chave, localização da chave, família e cifra, SP, entrada, SHA-256',
  'output.manifest': 'metadados exatos de leitura, lacunas e desencriptação',
  'output.readme': 'o que é a captura e quais são os seus limites',
  'output.keyFromDump':
    'A chave é recuperada do próprio dump, por isso não é preciso nenhum ficheiro de chave nem segredo do dispositivo.',
  'output.bestEffort':
    'Mesmo assim, a desencriptação não é garantida. Se não for encontrada nenhuma chave — por exemplo, numa unidade cujo bootloader deriva a chave da OTP do chip, que não está num dump da flash —, essa ranhura é simplesmente ignorada e o resto do arquivo não é afetado.',
  'gap.summary': 'A lacuna em {address}',
  'gap.where':
    'O conjunto de comandos USB tem um seletor de janela de leitura para cada bloco de 64 KB da flash de 4 MB, exceto `{range}`. Esse bloco é preenchido com `{fill}` na imagem combinada e registado em `{manifest}`.',
  'gap.costs':
    '**Na prática, isto não lhe custa nada.** Na maioria das câmaras, esse bloco é simplesmente flash apagada, que de qualquer forma se lê como `{fill}` — por isso o preenchimento corresponde ao que lá está e a imagem fica completa.',
  'gap.redundant':
    'E quando o bloco *está* em uso, o que contém é uma cópia redundante. Estas câmaras guardam a mesma imagem de firmware em várias ranhuras de 64 KB: em todos os dumps com várias ranhuras verificados durante a criação desta página, todas as ranhuras se desencriptaram em firmware idêntico byte a byte — num dos casos, em quatro ranhuras que tinham sido escritas com duas chaves diferentes. Na única unidade vista com uma imagem real em `{address}`, essa imagem era idêntica byte a byte às cópias em `{before}` e `{after}`, por isso o arquivo continua a conter esse firmware, apenas lido a partir de outro endereço.',
  'gap.fine':
    'Essa redundância é também a razão pela qual uma câmara cujo `{address}` se lê como `{fill}` está bem: o firmware arrancável continua a existir nas outras ranhuras. De qualquer forma, nada neste separador escreve no dispositivo — a lacuna só afeta o ficheiro que transfere.',
  'gap.complete':
    'Se quiser mesmo uma imagem estritamente completa, byte a byte — para comparar a flash com uma referência, por exemplo —, leia-a por SWD/J-Link ou com um programador SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Não lida: a câmara não disse qual o firmware que executa.',
  'identity.unsupported': 'Não lida: esta câmara não pode ser lida desta forma.',
  'identity.title': 'Câmara detetada',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'a partir das respostas da câmara, antes de ler qualquer ranhura',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opções',
  'options.subtitle': '— os valores predefinidos estão corretos; não precisa de alterar nada aqui.',
  'options.chunk': 'chunk (bytes por leitura control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill (byte de preenchimento)',
  'options.retries': 'tentativas por janela',
  'options.retryDelay': 'intervalo entre tentativas (ms)',
  'options.recipient': 'recipient (destinatário da transferência de controlo)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automático',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'desencriptar firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'sim',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'não',
  'options.help':
    '**chunk** é o tamanho de cada leitura control-IN, no máximo 64: um pacote EP0. Uma leitura mais longa pode perder um pacote para a ROM de arranque da câmara quando esta está em repouso a baixa frequência, por isso um valor maior é lido 64 bytes de cada vez; um valor menor é usado tal como está e, se uma câmara bloquear, a página baixa o valor sozinha e continua. **gap-fill** é o byte escrito no único bloco de 64 KB que o USB não alcança. **recipient** é interface por predefinição e passa para device se o browser não conseguir reservar a interface 0 — o firmware aceita ambos.',
  'options.chunkRange': 'chunk tem de estar entre 1 e {max}; recebido: {value}',
  'options.gapFillByte': 'gap-fill tem de ser um único byte; recebido: {value}',
  'options.retriesMin': 'as tentativas têm de ser zero ou mais; recebido: {value}',
  'options.retryDelayMin':
    'o intervalo entre tentativas tem de ser zero ou mais; recebido: {value}',
} satisfies Translation<'v4', 'pt'>;
