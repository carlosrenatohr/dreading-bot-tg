from formatter import format_message


def _reading():
    return {
        'title': 'Evangelio y Lecturas del XVI Domingo del Tiempo Ordinario',
        'date_title': '19 de julio de 2026',
        'message': 'Escucha la Palabra con el corazón.',
        'lecturas': [
            {'title': 'Primera Lectura', 'first_line': 'Lectura del libro...'},
            {'title': 'Evangelio', 'first_line': 'Lectura del santo evangelio según san Lucas'},
        ],
    }


def test_message_includes_title_gospel_incipit_and_message():
    text = format_message(_reading(), app_url='https://app.example/')

    assert 'XVI Domingo' in text
    assert '19 de julio de 2026' in text
    assert 'san Lucas' in text          # gospel incipit chosen, not the first reading
    assert 'Escucha la Palabra' in text
    assert 'https://app.example/' in text
    assert '<b>' in text and '<i>' in text


def test_handles_missing_fields_without_crashing():
    text = format_message({}, app_url=None)
    assert 'Lectura del día' in text


def test_escapes_html_special_characters():
    text = format_message({'title': 'A & <b>B</b>'})
    assert '&amp;' in text and '&lt;b&gt;' in text
