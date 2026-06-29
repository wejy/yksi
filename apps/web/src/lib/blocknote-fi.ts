import type { Dictionary } from '@blocknote/core/locales'

/** Finnish BlockNote UI strings (no built-in `fi` locale in BlockNote). */
export const fi: Dictionary = {
  slash_menu: {
    heading: {
      title: 'Otsikko 1',
      subtext: 'Ylätason otsikko',
      aliases: ['h', 'otsikko', 'otsikko1', 'h1'],
      group: 'Otsikot',
    },
    heading_2: {
      title: 'Otsikko 2',
      subtext: 'Pääosion otsikko',
      aliases: ['h2', 'otsikko2', 'alaotsikko'],
      group: 'Otsikot',
    },
    heading_3: {
      title: 'Otsikko 3',
      subtext: 'Alaosion otsikko',
      aliases: ['h3', 'otsikko3', 'alaotsikko'],
      group: 'Otsikot',
    },
    heading_4: {
      title: 'Otsikko 4',
      subtext: 'Pienemmän alaosion otsikko',
      aliases: ['h4', 'otsikko4', 'alaotsikko4'],
      group: 'Alaotsikot',
    },
    heading_5: {
      title: 'Otsikko 5',
      subtext: 'Pieni alaosion otsikko',
      aliases: ['h5', 'otsikko5', 'alaotsikko5'],
      group: 'Alaotsikot',
    },
    heading_6: {
      title: 'Otsikko 6',
      subtext: 'Pienin otsikkotaso',
      aliases: ['h6', 'otsikko6', 'alaotsikko6'],
      group: 'Alaotsikot',
    },
    toggle_heading: {
      title: 'Kokoontuva otsikko 1',
      subtext: 'Avattava ylätason otsikko',
      aliases: ['h', 'otsikko1', 'h1', 'kokoontuva'],
      group: 'Alaotsikot',
    },
    toggle_heading_2: {
      title: 'Kokoontuva otsikko 2',
      subtext: 'Avattava pääosion otsikko',
      aliases: ['h2', 'otsikko2', 'alaotsikko', 'kokoontuva'],
      group: 'Alaotsikot',
    },
    toggle_heading_3: {
      title: 'Kokoontuva otsikko 3',
      subtext: 'Avattava alaosion otsikko',
      aliases: ['h3', 'otsikko3', 'alaotsikko', 'kokoontuva'],
      group: 'Alaotsikot',
    },
    quote: {
      title: 'Lainaus',
      subtext: 'Lainaus tai ote',
      aliases: ['lainaus', 'blockquote', 'bq'],
      group: 'Peruslohkot',
    },
    toggle_list: {
      title: 'Kokoontuva lista',
      subtext: 'Lista, jonka alakohdat voi piilottaa',
      aliases: ['li', 'lista', 'kokoontuvalista', 'kokoontuva lista'],
      group: 'Peruslohkot',
    },
    numbered_list: {
      title: 'Numeroitu lista',
      subtext: 'Järjestetty lista',
      aliases: ['ol', 'li', 'lista', 'numeroitulista', 'numeroitu lista'],
      group: 'Peruslohkot',
    },
    bullet_list: {
      title: 'Luettelomerkitty lista',
      subtext: 'Lista ilman numeroita',
      aliases: ['ul', 'li', 'lista', 'luettelo', 'luettelomerkitty lista'],
      group: 'Peruslohkot',
    },
    check_list: {
      title: 'Tehtävälista',
      subtext: 'Lista valintaruuduilla',
      aliases: ['ul', 'li', 'lista', 'tehtävälista', 'valintaruutu', 'checkbox'],
      group: 'Peruslohkot',
    },
    paragraph: {
      title: 'Kappale',
      subtext: 'Tekstisisältö',
      aliases: ['p', 'kappale', 'paragraph'],
      group: 'Peruslohkot',
    },
    code_block: {
      title: 'Koodilohko',
      subtext: 'Koodilohko syntaksikorostuksella',
      aliases: ['koodi', 'code', 'pre'],
      group: 'Peruslohkot',
    },
    page_break: {
      title: 'Sivunvaihto',
      subtext: 'Sivun erotin',
      aliases: ['sivu', 'sivunvaihto', 'erotin'],
      group: 'Peruslohkot',
    },
    table: {
      title: 'Taulukko',
      subtext: 'Muokattavilla soluilla',
      aliases: ['taulukko', 'table'],
      group: 'Lisäominaisuudet',
    },
    image: {
      title: 'Kuva',
      subtext: 'Kuva kuvatekstillä',
      aliases: ['kuva', 'kuvanlataus', 'lataus', 'img', 'media', 'url'],
      group: 'Media',
    },
    video: {
      title: 'Video',
      subtext: 'Video kuvatekstillä',
      aliases: ['video', 'videonlataus', 'lataus', 'mp4', 'media', 'url'],
      group: 'Media',
    },
    audio: {
      title: 'Ääni',
      subtext: 'Upotettu äänitiedosto kuvatekstillä',
      aliases: ['ääni', 'äänenlataus', 'lataus', 'mp3', 'media', 'url'],
      group: 'Media',
    },
    file: {
      title: 'Tiedosto',
      subtext: 'Upotettu tiedosto',
      aliases: ['tiedosto', 'lataus', 'upotus', 'media', 'url'],
      group: 'Media',
    },
    emoji: {
      title: 'Emoji',
      subtext: 'Hae ja lisää emoji',
      aliases: ['emoji', 'hymiö'],
      group: 'Muut',
    },
    divider: {
      title: 'Erotinviiva',
      subtext: 'Erotin lohkojen välille',
      aliases: ['erotin', 'erotinviiva', 'hr', 'viiva'],
      group: 'Peruslohkot',
    },
  },
  placeholders: {
    default: "Kirjoita tekstiä tai käytä '/' komentoihin",
    heading: 'Otsikko',
    toggleListItem: 'Kokoontuva',
    bulletListItem: 'Lista',
    numberedListItem: 'Lista',
    checkListItem: 'Lista',
    emptyDocument: undefined,
    new_comment: 'Kirjoita kommentti...',
    edit_comment: 'Muokkaa kommenttia...',
    comment_reply: 'Lisää kommentti...',
  },
  file_blocks: {
    add_button_text: {
      image: 'Lisää kuva',
      video: 'Lisää video',
      audio: 'Lisää ääni',
      file: 'Lisää tiedosto',
    },
  },
  toggle_blocks: {
    add_block_button: 'Tyhjä kokoontuva lohko. Lisää lohko napsauttamalla.',
  },
  side_menu: {
    add_block_label: 'Lisää lohko',
    drag_handle_label: 'Avaa lohkon valikko',
  },
  drag_handle: {
    delete_menuitem: 'Poista',
    colors_menuitem: 'Värit',
    header_row_menuitem: 'Otsikkorivi',
    header_column_menuitem: 'Otsikkosarake',
  },
  table_handle: {
    delete_column_menuitem: 'Poista sarake',
    delete_row_menuitem: 'Poista rivi',
    add_left_menuitem: 'Lisää sarake vasemmalle',
    add_right_menuitem: 'Lisää sarake oikealle',
    add_above_menuitem: 'Lisää rivi yläpuolelle',
    add_below_menuitem: 'Lisää rivi alapuolelle',
    split_cell_menuitem: 'Jaa solu',
    merge_cells_menuitem: 'Yhdistä solut',
    background_color_menuitem: 'Taustaväri',
  },
  suggestion_menu: {
    no_items_title: 'Ei tuloksia',
  },
  color_picker: {
    text_title: 'Teksti',
    background_title: 'Tausta',
    colors: {
      default: 'Automaattinen',
      gray: 'Harmaa',
      brown: 'Ruskea',
      red: 'Punainen',
      orange: 'Oranssi',
      yellow: 'Keltainen',
      green: 'Vihreä',
      blue: 'Sininen',
      purple: 'Violetti',
      pink: 'Pinkki',
    },
  },
  formatting_toolbar: {
    bold: {
      tooltip: 'Lihavointi',
      secondary_tooltip: 'Mod+B',
    },
    italic: {
      tooltip: 'Kursivointi',
      secondary_tooltip: 'Mod+I',
    },
    underline: {
      tooltip: 'Alleviivaus',
      secondary_tooltip: 'Mod+U',
    },
    strike: {
      tooltip: 'Yliviivaus',
      secondary_tooltip: 'Mod+Shift+S',
    },
    code: {
      tooltip: 'Koodi',
      secondary_tooltip: '',
    },
    colors: {
      tooltip: 'Värit',
    },
    link: {
      tooltip: 'Lisää linkki',
      secondary_tooltip: 'Mod+K',
    },
    file_caption: {
      tooltip: 'Muokkaa kuvatekstiä',
      input_placeholder: 'Muokkaa kuvatekstiä',
    },
    file_replace: {
      tooltip: {
        image: 'Vaihda kuva',
        video: 'Vaihda video',
        audio: 'Vaihda ääni',
        file: 'Vaihda tiedosto',
      },
    },
    file_rename: {
      tooltip: {
        image: 'Nimeä kuva uudelleen',
        video: 'Nimeä video uudelleen',
        audio: 'Nimeä ääni uudelleen',
        file: 'Nimeä tiedosto uudelleen',
      },
      input_placeholder: {
        image: 'Nimeä kuva uudelleen',
        video: 'Nimeä video uudelleen',
        audio: 'Nimeä ääni uudelleen',
        file: 'Nimeä tiedosto uudelleen',
      },
    },
    file_download: {
      tooltip: {
        image: 'Lataa kuva',
        video: 'Lataa video',
        audio: 'Lataa ääni',
        file: 'Lataa tiedosto',
      },
    },
    file_delete: {
      tooltip: {
        image: 'Poista kuva',
        video: 'Poista video',
        audio: 'Poista ääni',
        file: 'Poista tiedosto',
      },
    },
    file_preview_toggle: {
      tooltip: 'Näytä/piilota esikatselu',
    },
    nest: {
      tooltip: 'Sisennä lohko',
      secondary_tooltip: 'Tab',
    },
    unnest: {
      tooltip: 'Poista sisennys',
      secondary_tooltip: 'Shift+Tab',
    },
    align_left: {
      tooltip: 'Tasaa vasemmalle',
    },
    align_center: {
      tooltip: 'Keskitä',
    },
    align_right: {
      tooltip: 'Tasaa oikealle',
    },
    align_justify: {
      tooltip: 'Tasaa molemmat reunat',
    },
    table_cell_merge: {
      tooltip: 'Yhdistä solut',
    },
    comment: {
      tooltip: 'Lisää kommentti',
    },
  },
  file_panel: {
    upload: {
      title: 'Lataa',
      file_placeholder: {
        image: 'Lataa kuva',
        video: 'Lataa video',
        audio: 'Lataa ääni',
        file: 'Lataa tiedosto',
      },
      upload_error: 'Virhe: lataus epäonnistui',
    },
    embed: {
      title: 'Upota',
      embed_button: {
        image: 'Upota kuva',
        video: 'Upota video',
        audio: 'Upota ääni',
        file: 'Upota tiedosto',
      },
      url_placeholder: 'Anna URL-osoite',
    },
  },
  link_toolbar: {
    delete: {
      tooltip: 'Poista linkki',
    },
    edit: {
      text: 'Muokkaa linkkiä',
      tooltip: 'Muokkaa',
    },
    open: {
      tooltip: 'Avaa uudessa välilehdessä',
    },
    form: {
      title_placeholder: 'Muokkaa otsikkoa',
      url_placeholder: 'Muokkaa URL-osoitetta',
    },
  },
  comments: {
    edited: 'muokattu',
    save_button_text: 'Tallenna',
    cancel_button_text: 'Peruuta',
    deleted_reference_text: 'Alkuperäinen sisältö poistettu',
    actions: {
      add_reaction: 'Lisää reaktio',
      resolve: 'Merkitse ratkaistuksi',
      reopen: 'Avaa uudelleen',
      edit_comment: 'Muokkaa kommenttia',
      delete_comment: 'Poista kommentti',
      more_actions: 'Lisää toimintoja',
    },
    reactions: {
      reacted_by: 'Reagoineet',
    },
    sidebar: {
      marked_as_resolved: 'Merkitty ratkaistuksi',
      more_replies: (count: number) => `${count} muuta vastausta`,
    },
  },
  generic: {
    ctrl_shortcut: 'Ctrl',
  },
}
