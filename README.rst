SinKMB
======

SinKMB is a Google App Engine project. It aims to synchronize your contacts
and status from diffirent micro-blogging services.

Requirment
----------

* `Django-nonrel`_
* `Djangoappengine`_
* `django-dbindexer`_
* `djangotoolbox`_
* `autoload`_
* `jQuery`_
* `Bootstrap`_

Twitter support
^^^^^^^^^^^^^^^

* `tweepy`_

Plurk support
^^^^^^^^^^^^^

* `plurk-oauth`_
    * `oauth2`_
        * `httplib2`_

Deploy to Google App Engine
---------------------------

You need to copy above external modules, or create symbolic links (prefered).
`jQuery`_ and `Bootstrap`_ should place in **main/static**, the others
should place in root level, i.e. same directory with **manage.py**.

::

    autoload/
    dbindexer/
    django/
    djangoappengine/
    djangotoolbox/
    httplib2/
    main/static/bootstrap.css
    main/static/jquery.js
    oauth2/
    plurk_oauth/
    tweepy/

Site specific settings
----------------------

Site specific settings will load from **private/settings.py**, you should put
your own settings here. Our setting has been encrypted to
**private/settings.py.asc**, only contributers could decrypt it.


.. _Django-nonrel: https://github.com/django-nonrel/django-nonrel
.. _Djangoappengine: https://github.com/django-nonrel/djangoappengine
.. _django-dbindexer: https://github.com/django-nonrel/django-dbindexer
.. _djangotoolbox: https://github.com/django-nonrel/djangotoolbox
.. _autoload: https://github.com/adieu/django-autoload
.. _jQuery: http://jquery.com
.. _Bootstrap: http://twitter.github.com/bootstrap/
.. _tweepy: https://github.com/tweepy/tweepy
.. _plurk-oauth: https://github.com/clsung/plurk-oauth
.. _oauth2: https://github.com/simplegeo/python-oauth2
.. _httplib2: https://github.com/uggedal/httplib2
