/**
 * Namespace `info`, português europeu (pt), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Ainda não lida.',
  'status.reading': 'A ler...',
  'status.noVersion': 'Nenhuma versão indicada.',
  'status.tooOld': 'Lida. O firmware {version} é anterior a 0.8.0.0 — não foi lido mais nada.',
  'status.read': 'Lida. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Ler a câmara',
  'read.description':
    'Só leitura. Pergunta à câmara o que executa, como arranca, que chaves tem e o que contém cada ranhura: a mesma leitura que seek-fw info. Não é escrito nada.',
  'read.actions': 'Ações de informação',
  'read.button': 'Ler versão do firmware',
  'read.connectFirst': 'Primeiro, conecte a câmara acima e depois prima «Ler versão do firmware».',
  'read.showDetails': 'Mostrar detalhes no registo',
  'read.panel': 'Versão do firmware',
  'result.title': 'O que a câmara indica',
  'result.version': 'Versão do firmware',
  'result.build': 'Compilação',
  'result.range': 'Gama de versões',
  'result.tab': 'Separador para esta câmara',
  'result.rangeLegacy': '0.x / 1.x: as câmaras de 2014 e 2016',
  'result.rangeModern': '2.x e posteriores: as câmaras 4.x, Nano e Mosaic',
  'result.rangeUnknown': 'desconhecida',
  'result.noVersion':
    '**A câmara não indicou a versão do firmware.** Não foi enviado mais nada. Desconecte-a, volte a conectá-la, deixe-a terminar o arranque e leia de novo.',
  'result.noTab': 'Nenhum separador lê esta compilação.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Abra <tab>{tab}</tab> para esta câmara. Esse separador volta a perguntar à câmara qual é a sua família antes de ler o que quer que seja, e recusa uma câmara que não seja da família que cobre.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Para que serve cada separador',
  'tabs.intro':
    'Cinco separadores, por esta ordem. Cada um é uma página própria, e o cabeçalho mostra em qual está.',
  'tabs.caption': 'Os separadores, o que fazem, as câmaras que cobrem e se escrevem na câmara',
  'tabs.tab': 'Separador',
  'tabs.does': 'O que faz',
  'tabs.cameras': 'Câmaras',
  'tabs.writes': 'Escreve na câmara?',
  'tabs.info.does':
    'Lê o que a câmara indica: o firmware, a família com que se identifica, como arranca, as chaves e cada ranhura. A mesma leitura que seek-fw info. Não escreve nada.',
  'tabs.info.cameras': 'Qualquer câmara Seek que o WebUSB consiga abrir.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Não.',
  'tabs.preserve.does':
    'Faz uma cópia completa da memória flash de 4 MB da câmara, com um ficheiro de execução guardado depois de cada passo. Para a ler toda, aplica durante algum tempo um patch ao firmware, depois repõe o firmware original e verifica-o. Guia-o pelos passos, um de cada vez.',
  'tabs.preserve.cameras':
    'Câmaras com firmware 0.x e 1.x: as compilações Compact de 2014, as compilações Compact PRO de 2016 (1.0.3.x) e a compilação Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Sim, em dois passos, e cada um pede confirmação antes. Deixa a câmara como estava.',
  'tabs.v4.does':
    'Lê toda a memória flash de uma câmara 4.x ou Nano e desencripta as ranhuras de firmware que encontrar. Só leitura: envia seis comandos de leitura e nenhum de escrita.',
  'tabs.v4.cameras':
    'Câmaras com firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x e 2.x) e Nano (42.x e 44.x), de 2018 em diante.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Não.',
  'tabs.decrypt.does':
    'Desencripta um ficheiro que já tem: um dump completo, ranhura a ranhura, ou uma única ranhura de firmware de 64 KB. O resultado pode ser transferido.',
  'tabs.decrypt.cameras':
    'Nenhuma. Não usa câmara, por isso funciona sem nada conectado e em qualquer browser.',
  'tabs.decrypt.writes': 'Não. Só escreve a transferência.',
  'tabs.slots.does':
    'Lê as três ranhuras de firmware (ranhura A, ranhura B e ranhura de recuperação R), mostra o que cada uma contém e a partir de qual a câmara arranca, e pode fazer o dump ou escrever uma ranhura de cada vez.',
  'tabs.slots.cameras': 'Câmaras com firmware 0.8.0.0 ou posterior.',
  'tabs.slots.writes': 'Sim, uma ranhura de cada vez, e cada escrita pede confirmação antes.',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': 'Onde estão as compilações de 2016 e 1.3.0.8 FF',
  'split.where':
    'As compilações Compact PRO de 2016 (1.0.3.0 e 1.0.3.2, incluindo as variantes FF) e a compilação Compact 1.3.0.8 FF (16 Hz) **não** são câmaras 4.x e não são lidas como tal. O protocolo delas é o protocolo bloqueado de 2014–2017, e o firmware guarda as ranhuras com uma cifra diferente (2016) ou como a cadeia sem encriptação de 2014, com uma via só de recuperação (FF). Por isso estão em **Dump e desencriptação 0.x/1.x 2014/2016**, e o separador 4.x/Nano recusa-as antes de ler o que quer que seja.',
  'split.evidence':
    'Os indícios de que funcionam no separador 0.x/1.x: o processo Preserve tem um patch derivado para cada uma delas, e as execuções no emulador passam em ambas. A compilação 1.0.3.0, no seu dump nativo de 2016, passou pela cópia de segurança, patch, escrita, leitura completa, restauro e verificação; a 1.3.0.8 FF passou pela sua via de recuperação. Na câmara de bancada, uma Compact PRO 1.0.3.0, a leitura do passo 02 do Preserve terminou sem reinício e sem escrita, e foi identificada na câmara a cifra de 2016. Nestas compilações, o mapa de seletores 4.x é recusado em 38 dos seus 63 seletores, por isso o separador 4.x só conseguiria devolver lacunas para eles.',
  /* "There" is the 4.x/Nano tab: the page once had a firmware-family selector there, and it is gone, so no setting routes these builds into the 4.x/Nano read. */
  'split.stay':
    'Por isso ficam no separador 0.x/1.x, e o separador 4.x/Nano não tem nenhum seletor de família que as envie para lá.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Câmara',
  'report.product': 'Produto',
  'report.manufacturer': 'Fabricante',
  'report.serial': 'Número de série',
  'report.platform': 'Plataforma',
  'report.usbLink': 'Ligação USB',
  'report.noProduct': '(sem nome de produto)',
  'report.none': '(nenhum)',
  'report.unreadable': '(ilegível)',
  'report.firmware': 'Firmware',
  'report.running': 'Em execução',
  'report.bootloader': 'Bootloader',
  'report.family': 'Família de firmware',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Lida como',
  'report.detected': 'Detetada',
  'report.boot': 'Arranque',
  'report.booted': 'Ranhura de arranque',
  'report.lastStart': 'Último arranque',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Em execução (1.3.0.8)',
  'report.nextStart': 'Próximo arranque',
  'report.upgradeTarget': 'Destino da atualização',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(não perguntado)',
  'report.targetConfirmed': '{slot} (confirmada no tráfego USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'desconhecida: {why}. Uma imagem FF de 16 Hz precisa que a câmara diga qual a compilação que executa (o separador de ranhuras pergunta)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'a compilação 1.3.0.8 FF de 16 Hz',
  'report.build8Hz': 'a compilação 1.3.0.8 de 8 Hz',
  'report.keys': 'Chaves',
  'report.slots': 'Ranhuras',
  'report.slotsCaption':
    'Cada ranhura tal como a leitura a encontrou. Só leitura: quem escreve é o separador de ranhuras.',
  'report.slot': 'Ranhura',
  'report.address': 'Endereço',
  'report.version': 'Versão',
  'report.size': 'Tamanho',
  'report.key': 'Chave',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Aceita',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Rodapé',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Arrancável',
  'report.bytes': '{count} B',
  'report.plaintext': 'nenhuma (sem encriptação)',
  /** A table value, lower case: "yes". */
  'report.yes': 'sim',
  /** A table value, lower case: "no". */
  'report.no': 'não',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/a',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Escrita',
  'report.noBankWritten': 'Nenhuma ranhura desta câmara é escrita:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Uma ranhura de cada vez: o separador de ranhuras escreve uma ranhura desta câmara ou aplica-lhe o patch, cada ranhura preparada sem chave (a imagem tal como está), e cada escrita pede confirmação antes.',
  'report.oneBank.slotKeystream':
    'Uma ranhura de cada vez: o separador de ranhuras escreve uma ranhura desta câmara ou aplica-lhe o patch, cada ranhura preparada com o bloco de chaves 0 da própria imagem, e cada escrita pede confirmação antes.',
  'report.oneBank.keyA':
    'Uma ranhura de cada vez: o separador de ranhuras escreve uma ranhura desta câmara ou aplica-lhe o patch, cada ranhura preparada com chaves derivadas da ranhura de arranque e da aplicação em execução, e cada escrita pede confirmação antes.',
  'report.oneBank.ffVendor':
    'Uma ranhura de cada vez: o separador de ranhuras escreve uma ranhura desta câmara ou aplica-lhe o patch, cada ranhura preparada como a aplicação do fabricante prepara a imagem FF de 16 Hz (a imagem XOR o seu próprio bloco de chaves 0) e guardada pela câmara com a chave B, e cada escrita pede confirmação antes.',
  'report.refusesEvery': 'O separador de ranhuras recusa todas as ranhuras desta câmara:',
} satisfies Translation<'info'>;
