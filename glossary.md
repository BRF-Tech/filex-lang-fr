# filex — French glossary (fr)

The terminology used across `translations/fr.json`. One English concept → one French term,
everywhere in the product. When a term below does not fit a sentence, rephrase the sentence —
do not switch terms.

## Voice and register

- **Standard French (France)**, clean product voice, no literal calques. Prefer the wording French
  users already know from Windows, macOS, Google Drive, Nextcloud and WordPress.
- **Vous**, consistently: *Saisissez votre mot de passe*, *Votre compte*, *Demandez à un administrateur…*.
  Never *tu*.
- **Buttons and menu items are infinitives**: *Enregistrer*, *Supprimer*, *Renommer*, *Créer un lien*.
  Headings and labels are nouns: *Paramètres*, *Corbeille*, *Versions*.
- **Sentence case** everywhere (French does not title-case): *Raccourcis clavier*, not
  *Raccourcis Clavier*, even where the English is Title Case.
- **Status words agree with the implied subject**: masculine by default (*le fichier*, *l'élément*):
  *Activé*, *Enregistré*, *Copié*; feminine when the thing is (*la règle*, *l'application*):
  *Activée*, *Installée*.
- **Articles**: French needs them where English drops them — *Supprimer le fichier*, *Vider la corbeille*.
  In very short labels (buttons, column headers, chips) drop them if the result is natural
  (*Nouveau dossier*, *Taille*, *Modifié le*).
- **Keep UI labels short.** French runs 15–25 % longer than English. In side-nav items, tabs, chips,
  buttons, stat tiles and column headers use the shortest natural wording.
- **Units**: French byte units — *o, Ko, Mo, Go, To, Po* (`unit.*` keys and prose alike: « 92 Mo »).
  Time units in prose: *24 h*, *5 min*, *30 s*, *jours*.

## Typography (applied mechanically by `scripts/normalize.mjs` after translation)

| What | Rule |
|---|---|
| `:` | U+00A0 NO-BREAK SPACE before it in prose: *Nom : {name}* → `Nom : {name}` |
| `;` `!` `?` | U+202F NARROW NO-BREAK SPACE before it in prose: *Supprimer ?* → `Supprimer ?` |
| « guillemets » | French quotes for every prose quotation (English “…” and "…"), with U+00A0 inside: `« {name} »` |
| apostrophe | typographic ’ (U+2019) in prose: *l’utilisateur* |
| `…` | kept as the single character, no space before it |

**Never** touched by these rules: text inside `` `code` `` spans, `{placeholder}` and `{'@'}`, URLs
(`https://`, `storage://folder`), `tag:` search syntax, `plugin:<driver>`, key combos (`Ctrl+K`),
times (`12:30`), `GMT+3` offsets, and anything a user has to type exactly. Both spaces are
non-breaking, so a line can never begin with `:` `;` `!` `?` or `»`. None of them sit next to a
placeholder the UI fills in, and no string loses or gains leading/trailing whitespace.

## Syntax that must survive (never translated)

| What | Rule |
|---|---|
| `{placeholder}` | kept verbatim; words around it are translated |
| a syntax token in angle brackets (`root:<storage>://<folder>`) | **translated**, like the Turkish catalogue's `root:<depo>://<klasör>` — it describes what the reader types, it is not a literal (Burak, 2026-09-23). The number of `<…>` tokens must stay the same |
| `a \| b` (admin SPA plurals) | THREE branches, `zéro \| un \| plusieurs`, throughout the pack (see “Plurals”) |
| `key` / `key_one` (explorer / server plurals) | one key per CLDR category; `_one` covers 0 AND 1 in French, the plain key is `other` (see “Plurals”) |
| `{'@'}` | kept exactly (vue-i18n literal); never a bare `@` in an admin-panel string |
| `@` in explorer strings | literal, never escaped (the explorer's `t()` is a plain replace) |
| `` `code` `` spans, `<…>` tokens, env vars, CLI flags, paths, key combos | verbatim |
| `tag:` search syntax | verbatim — the server parses it (`tag:facture` works; `étiquette:` would not) |
| `plugin:<driver>`, `name://folder`, `storage://folder`, `main://projects/acme` | verbatim |
| leading/trailing spaces, trailing `…` and `:` | kept |

## Product and proper names — untouched

filex, ONLYOFFICE (the product's one spelling, never translated), draw.io / diagrams.net, WebDAV, SFTP, FTP,
FTPS, NFS / NFSv3, SMB / CIFS, NAS, S3, MinIO, Hetzner, AWS, Backblaze B2, ClamAV, clamd, MCP, API,
REST, PIN, OIDC, LDAP, Active Directory, SSO, TOTP, 2FA, RBAC, JWT, SMTP, TLS, HTTPS, CIDR, DN, ETag,
MIME, SHA-256, HMAC, ed25519, PEM, PKCS#8, WebAssembly, Wasm, GitHub, Claude, rclone, restic,
Cyberduck, WinSCP, FileZilla, PuTTYgen, davfs2, sshfs, s3fs, WinFsp, macFUSE, Finder, GNOME Files,
Dolphin, PowerShell, Markdown, CSV, PDF, PWA, Windows, macOS, Linux, Keycloak, Auth0, Authentik,
Bleve, Vue, React, Go, cron, webhook, endpoint, bucket, backend, proxy.

## Terms

| English | French | Notes |
|---|---|---|
| file | fichier | |
| folder / directory | dossier / répertoire | |
| item (a file or folder) | élément | 1 élément / {n} éléments |
| storage (a mounted backend) | stockage (pl. stockages) | "Add storage" → *Ajouter un stockage*; "Storages" → *Stockages* |
| drive | lecteur | a mounted drive on the reader's own machine: Windows "drive letter" → *lettre de lecteur*. ⚠ Never for a filex storage — see *Decisions* |
| mount / mounted | monter / montage / monté | "mount point" → *point de montage* |
| connection / connect | connexion / se connecter | "How to connect" → *Comment se connecter* |
| share (verb) | partager | "Share" button → *Partager* |
| share / share link | partage / lien de partage | admin "Shares" → *Partages*; "My shares" → *Mes partages* |
| shared with me | partagés avec moi | plural in the navigation, as Google Drive writes it |
| SMB share (network share) | partage réseau | only for SMB/CIFS; field "Share" → *Partage réseau* |
| link | lien | "Copy link" → *Copier le lien* |
| request files / file request | demander des fichiers / demande de fichiers | |
| upload link, drop link, request link | lien de dépôt | inbound links that collect files |
| upload (verb / noun) | téléverser / téléversement | "Uploaded" → *Téléversé*; "Upload" button → *Téléverser* |
| download (verb / noun) | télécharger / téléchargement | |
| sync | synchroniser / synchronisation | "Sync runs" → *Exécutions de synchronisation* |
| trash | corbeille | "Move to trash" → *Placer dans la corbeille*; "Empty trash" → *Vider la corbeille* |
| delete / delete permanently | supprimer / supprimer définitivement | |
| purge | purger | |
| remove (detach a key, tag, plugin) | retirer | |
| restore | restaurer | |
| rename | renommer | |
| version | version | "Version history" → *Historique des versions* |
| snapshot | instantané | |
| tag (noun / verb) | étiquette / étiqueter | ⚠ never use *étiquette* for "label" |
| label (a name you give a token/key/export) | libellé | an app's "Label" field → *Libellé* too |
| star / starred / unstar | ajouter aux favoris / favoris / retirer des favoris | column "Star" → *Favori* |
| recent | récents | |
| home | accueil | |
| app (WebAssembly app) | application (pl. applications) | "Apps" → *Applications* |
| plugin (storage plugin) | extension (pl. extensions) | "Storage plugins" → *Extensions de stockage* |
| WebAssembly module | module (.wasm) | the app's binary; not a plugin |
| file extension | extension de fichier | always qualified, to stay apart from *extension* = plugin |
| driver | pilote | |
| manifest | manifeste | |
| signature / sign | signature / signer | "signed app" → *application signée* |
| signer | signataire | |
| requester | demandeur | |
| initials | initiales | |
| box (a field placed on a PDF) | zone | |
| field | champ | |
| permission | autorisation | "Permissions" panel → *Autorisations* |
| grant (noun) / grant (verb) | droit d'accès / accorder | "Grants" → *Droits d'accès*; "Grant revoked" → *Droit d'accès révoqué* |
| access | accès | "People with access" → *Personnes ayant accès* (the share dialog's section); "Who has access" (`access.ui.people_with_access`, v0.50.0) → *Qui a accès* |
| revoke | révoquer | |
| owner | propriétaire | |
| administrator / admin | administrateur / admin | "Admin panel" → *Panneau d'administration*; "Admins only" → *Administrateurs uniquement* |
| operator | opérateur | |
| instance | instance | |
| tenant / multi-tenant | locataire / multilocataire | as in Microsoft's French UI |
| user / account | utilisateur / compte | |
| role: Administrator / User / Viewer | Administrateur / Utilisateur / Lecteur | |
| permission level: Viewer / Editor / Owner | Lecteur / Éditeur / Propriétaire | |
| viewer (the preview component) | visionneuse | |
| sign in / sign out / sign-in | se connecter / se déconnecter / connexion | "Log out" → *Se déconnecter* |
| username / password | nom d'utilisateur / mot de passe | |
| email (v0.43.0 respelt English's "e-mail") | e-mail / adresse e-mail | not *courriel* (Québec); the French spelling keeps its hyphen |
| two-factor authentication / 2FA | authentification à deux facteurs / 2FA | "second factor" → *second facteur* |
| recovery code / recovery key | code de récupération / clé de récupération | |
| key escrow / escrow key | séquestre de clés / clé de séquestre | |
| encrypted / encrypt / decrypt | chiffré / chiffrer / déchiffrer | never *crypter*; "end-to-end encrypted" → *chiffré de bout en bout* |
| lock / locked / unlock | verrouiller / verrouillé / déverrouiller | a file lock → *verrou* |
| permission (what an API key may do) | autorisation (pl. *autorisations*) | ⚠ v0.43.0 retired English's "scope" for this: one term on every screen — the column, the field, the hint, the refusal from the server |
| API key (the ONE term since v0.43.0 — English retired "API token") | clé d’API (pl. *clés d’API*) | every screen: *Clés d’API*, *Nouvelle clé d’API*; no string says *jeton d’API* any more |
| token (somebody else's — a Bearer token, an OIDC *token endpoint*, a plugin's remote token) | jeton | the only surviving use; never for a filex API key |
| access key / secret key | clé d'accès / clé secrète | |
| secret (webhook/client secret) | secret | |
| scope (OIDC only) | portée | ⚠ ONLY the OIDC scope names an identity provider defines (`authProviders.fields.scopes`). What an API key may do is a **permission** since v0.43.0, and `search.scope` ("Look in") is no longer a scope at all |
| claim (OIDC) | claim | the name identity providers show; "Role claim" → *Claim de rôle* |
| header (HTTP) | en-tête | |
| endpoint / bucket | endpoint / bucket | kept, as S3 providers' consoles show them |
| export (NFS) | export | "NFS exports" → *Exports NFS* |
| path / root | chemin / racine | |
| host / port | hôte / port | |
| quota / retention | quota / rétention | |
| job / queue / queued | tâche / file d'attente / en file d'attente | |
| operation | opération | operations tray → *panneau des opérations* |
| audit log / log | journal d'audit / journal | |
| replica / replication | réplique / réplication | |
| search index | index de recherche | |
| storage scan / scan exclusions | analyse / chemins exclus de l’analyse | the walk over a storage (*Intervalle d’analyse*); the same word as *analyse antivirus*, the context tells them apart |
| catalogue (what the scan records) | catalogue / catalogué | "not catalogued" → *ne sont pas catalogués* |
| catalog (verb) / cataloging (v0.44.0) | cataloguer / catalogage | *Tout cataloguer*, *Catalogage en cours* |
| lazy catalog (a sync mode) | catalogue différé | as *chargement différé* for lazy loading; its behaviors *D’abord le dossier ouvert, le reste en arrière-plan* / *À l’ouverture uniquement*; the background pass → *parcours en arrière-plan* |
| watch / watched (a folder, for changes made outside filex) | surveiller / surveillé | |
| usage (the storage-used figure) | espace utilisé | as *{used} utilisés*; the *Utilisation et coût* page is a different thing |
| archive / extract | archive / extraire, extraction | "Extract here" → *Extraire ici*; "solid archive" → *archive solide*; MiB → *Mio* (French IEC units) |
| package manager | gestionnaire de paquets | Homebrew, winget and Snap stay as written |
| attempt / attempt timeout / give up after (a storage's network settings, v0.45.0) | tentative / délai par tentative / abandonner après | as *Délai de connexion*; "Attempts per request" → *Tentatives par requête*; retrying → *nouvelles tentatives*, "is never retried" → *n’est jamais retenté*; an S3 "store" is *le service*, as in the other S3 hints |
| drag-out download (audit, v0.45.0) | téléchargement par glisser-déposer | an audit verb, so a noun (see *Audit verbs are nouns*) |
| what an update policy does here (badge, v0.45.0) | *Annonce seulement* / *Installe les correctifs* / *Installe les versions mineures* / *Vérification désactivée* | third person, the install is the subject; the policy's own name stays an infinitive (*annoncer seulement*) |
| storage order (navigation panel and admin Storages, v0.46.0) | *Monter* / *Descendre* / *Trier par nom* / *Utiliser l’ordre par défaut* | *Rétablir l’ordre par défaut* on the admin page |
| queued purge / restore / rename (operations panel and admin tray, v0.47.0) | *Suppression définitive* / *Restauration* / *Renommage* | nouns in both places, as *Copie*, *Déplacement*; column "Deleted by" → *Supprimé par* |
| a count that failed, beside the one that worked (v0.47.0) | *{failed} en échec* | number-neutral, as in `access.ui.mail_partial`: *3 éléments restaurés ; 1 en échec : …* — it reads right whatever `{failed}` is, also in a `_one` form (which French shows for 0 too) |
| a dialog closed while it works (v0.47.0) | *Continuer* / *Arrêter et fermer* | "this page says when it is done" → *cette page vous préviendra quand …* |
| an app's own updates (Apps list and install wizard, v0.47.0) | *mises à jour automatiques*; badges *Mise à jour disponible* / *Approbation requise* / *Échec de la mise à jour* / *Vérification impossible* / *Mise à jour automatiquement*; button *Rechercher des mises à jour*; row action *Vérifier la mise à jour* | the button is the wording French UIs use for "Check for updates"; the check itself stays *vérification des mises à jour*, as on the Updates page; "approval" → *approbation*; "New" beside a permission → *Nouvelle* (une autorisation) |
| an app's `filex` range (v0.47.0) | *Fonctionne avec filex {requires} ; ce serveur exécute {filex}* / *Incompatible avec ce filex* | "this is {filex}" names the server, as `server.notify.update_available.body` does; "development build" → *version de développement* |
| pattern (glob) | motif (glob) | *Motif de chemin*; the pattern itself (`.git`, `*.tmp`, `downloads/incomplete/**`) stays as written |
| emptying the trash / server log | vidage de la corbeille / journal du serveur | "Emptying the trash…" → *Vidage de la corbeille…* |
| preview | aperçu | |
| details panel (inspector) | panneau de détails | |
| command palette | palette de commandes | |
| keyboard shortcut | raccourci clavier | |
| tour | visite guidée | |
| explorer | explorateur | |
| desktop app | application de bureau | |
| computer | ordinateur | |
| browser / device | navigateur / appareil | |
| settings / preferences | paramètres / préférences | |
| appearance / theme / palette | apparence / thème / palette | |
| branding | image de marque | |
| dashboard | tableau de bord | |
| usage & cost | utilisation et coût | |
| update (software) / upgrade | mise à jour / mettre à jour | |
| default | par défaut | "Reset to default" → *Rétablir les valeurs par défaut* |
| custom / customize | personnalisé / personnaliser | |
| enable / disable / enabled / disabled / on / off | activer / désactiver / activé / désactivé | |
| healthy / reachable / unreachable | opérationnel / joignable / injoignable | |
| pending / running / failed / done | en attente / en cours / échec / terminé | "Done" button → *Terminé* |
| retry / try again | réessayer | |
| dismiss | ignorer | |
| cancel / undo | annuler / annuler | as in every French UI (Ctrl+Z = *Annuler*) |
| refresh / reload | actualiser / recharger | |
| reset | réinitialiser | |
| enter (type into a field) | saisir | *Saisissez un nombre…* |
| click / right-click / tap / tick | cliquer / clic droit / appuyer / cocher | |
| drag / drop | faire glisser / déposer | "Drop files here" → *Déposez les fichiers ici* |
| required / optional | obligatoire / facultatif | |
| probe (conformance) | test | "Conformance report" → *Rapport de conformité* |
| wake-up (scheduled app) | réveil | |
| payload / severity | charge utile / gravité | |
| slot (a free concurrency slot) | emplacement (libre) | |
| duplicates | doublons | |
| thumbnail | miniature | |
| symlink | lien symbolique | |
| breadcrumb | fil d'Ariane | |
| tab / split view | onglet / vue partagée | |
| drift report | rapport de dérive | |
| checksum | somme de contrôle | |
| expiry / expires | expiration / expire le | |
| offline / online | hors ligne / en ligne | |
| role (a named set of permissions; every person has exactly one, v0.49.0) | rôle (pl. *rôles*) | nav and page → *Rôles*; "New role" → *Nouveau rôle*; a custom role's name is the administrator's text, never translated, in « » in prose (*le rôle « Stagiaires »*) |
| built-in role | rôle intégré | *Administrateur* / *Utilisateur* / *Lecteur*, as `users.roles.*`; badge "Built-in" → *Intégré*; audit resource → *Rôle intégré* |
| custom role | rôle personnalisé | badge "Custom" → *Personnalisé* |
| permission (what a role allows, v0.49.0) | autorisation | the same word as an API key's and an app's permission; "{count} of {total} permissions" → *Autorisations : {count} sur {total}*; group buttons "All" / "None" → *Toutes* / *Aucune* |
| exception (set for one person only) | exception | "Exceptions for this person" → *Exceptions pour cette personne*; Users-list badge → *Avec exceptions* |
| Inherit / Allow / Deny (buttons) | Hériter / Autoriser / Refuser | infinitives, as buttons; a role's summary "Allows: / Denies:" → *Autorise : / Refuse :* |
| Allowed / Denied (the result beside a permission) | Autorisé / Refusé | masculine, impersonal (*c’est autorisé*), as *Non autorisé*; the source after « · » is a lowercase fragment: *rôle intégré*, *rôle « X »*, *exception pour cette personne*, *administrateurs uniquement*, *compte en lecture seule*, *rôle « X » désactivé* |
| preset | préréglage | as `replica.settings.cronPreset`; *Admin complet* / *Utilisateur standard* / *Lecture seule* / *Téléversement uniquement* / *Invité*; the badge of a person whose permissions match no preset → *Autorisations personnalisées* (not *Personnalisé*, the custom-role badge) |
| limit (what a role restricts) | limite | "Limits from roles" → *Limites issues des rôles* |
| Folder access (the per-file and per-folder grants page, renamed in v0.49.0) | Accès aux dossiers | nav, page title and audit resource; kept apart from *autorisation*. What the page lists are still *droits d’accès* |
| switch off (a role) | désactiver / désactivé | badge "Off" → *Désactivé* (le rôle) |
| plugin request / install request | demande d’extension / demande d’installation | the umbrella "plugin" is *extension*, as `nav.plugins`; statuses are feminine (la demande): *En attente* / *Approuvée* / *Rejetée* / *Expirée* / *Source modifiée* |
| approve / reject (a request) | approuver / rejeter | *rejeter* leaves *refuser* to Deny; audit nouns *approbation* / *rejet* / *expiration* |
| Monitor (a permission) | Supervision | |
| starting role for SSO groups | rôle de départ pour les groupes SSO | |
| an app permission's Default (v0.49.0, role and person editors) | Par défaut | the choice beside *Autoriser* / *Refuser*; with what it comes to: *Par défaut (autorisé)* / *Par défaut (refusé)*; the source after « · » → *valeur par défaut de l’application*; the app's own default: *Valeur par défaut de l’application : tout le monde / personnes pouvant modifier des fichiers / administrateurs uniquement* |
| a role's name in other languages (v0.49.0) | nom et description dans d’autres langues | *Nom du rôle ({language})*, *Description ({language})*; "{count} languages" → *{count} langues* (three forms, as every admin plural) |
| group (a named set of people, v0.50.0) | groupe (pl. *groupes*) | nav and page → *Groupes*; "New group" → *Nouveau groupe*; its people are *membres*; a group's name is the administrator's text, in « » in prose (*le groupe « Compta »*); "through the group" → *via le groupe « X »*; "How they joined" → *Origine*, values *Ajout manuel* / *SSO*; audit resource "Group folder access" → *Accès aux dossiers d’un groupe* |
| SSO group (what a sign-in carries) | groupe SSO | "carries" → *transmet*; "Role priority" → *Priorité du rôle* |
| identity provider | fournisseur d’identité | the admin page stays *Fournisseurs d’authentification*; a sign-in provider in a label → *fournisseur de connexion*, as the audit resource |
| sign-in security (v0.50.0) | sécurité de connexion | nav, page title, audit resource and target |
| wrong attempt / failed attempt | tentative échouée | ONE term for both English words (the admin panel says "wrong", the server's sentences "failed"); "Wrong attempts per account" → *Tentatives échouées par compte*; "Wrong credentials" → *Identifiants incorrects* |
| sign-in lock (an account or an address locked out after failed attempts) | verrouillage (pl. *verrouillages*) / verrouillé | ⚠ deliberately not *verrou*, which stays a file lock (`appPlugins.detail.locks.*`): *verrouillage* is the French Windows builds' word for an account lockout (*Stratégie de verrouillage du compte*). "First lock" / "Longest lock" → *Premier verrouillage* / *Verrouillage le plus long*; "Lock step" → *Palier de verrouillage*; "Locks" → *Verrouillages*; the event "Locked" → *Verrouillé*, as `applock.badge` |
| lift the lock (a sign-in lock) | lever le verrouillage | "Lock lifted" → *Verrouillage levé*; audit verb → *levée du verrouillage*; "Lifted by an administrator" → *Levé par un administrateur*. The consistency report lists "Lift the lock" twice (*Lever le verrou* for a file lock): intended |
| counting window | fenêtre de comptage | status "Counting" → *Comptage en cours* |
| allowed addresses / allow-list | adresses autorisées | the address is exempt (*Aucune adresse n’est exemptée*), so the event "Allow-list pass" → *Exemption (adresse autorisée)* |
| trusted proxy | proxy de confiance (pl. *proxys de confiance*) | as `authProviders.fields.trusted_proxies`; loopback → *bouclage*; link-local → *lien-local*; private networks → *réseaux privés*; "classes of address" → *catégories d’adresses* |
| door (where a password is typed: the web form, WebDAV, FTP, SFTP, S3) | point d’entrée | "Web form" → *Formulaire web* |
| test account (the real account a sign-in test uses) | compte de test | as *test* for a probe; "signs a real account in" → *connecte un vrai compte* |
| super administrator | super-administrateur | |
| first sign-in rule | règle de première connexion | "Open an account at the first sign-in" → *Créer un compte à la première connexion* |
| operating-system account / Linux account / Windows account | compte du système d’exploitation / compte Linux / compte Windows | Windows' built-in account and policy names are the French builds' own (*Administrateur*, *Invité*, *AUTORITE NT*, *Accéder à cet ordinateur à partir du réseau*) - see *Decisions* |
| realm (an organization's sign-in name on the login page) | realm (*le realm*) | kept, as *claim*: the word identity providers (Keycloak) show. *Domaine* is taken by the Windows domain and the e-mail domain of the same feature. The label *Realm* is identical to the English and allowed in `validate-fr.mjs` (`IDENTICAL_OK`) |
| default apps (which app opens, and which draws the thumbnail of, each kind of file, v0.50.0) | applications par défaut | admin tab, audit resource and the user's own section in *Paramètres*; "draw thumbnails" → *générer les miniatures* (never *dessiner*); the column "Draws thumbnails" → *Génération des miniatures* (*Génère …* at the start of a label trips the "tu" lint); "Back to the default" → *Rétablir l’ordre par défaut* |
| own domain (a tenant's CNAME, v0.50.0) | domaine personnalisé | kept apart from the realm and from the tenant's *Adresse propre* (`tenants.fields.host`) |
| slug (a tenant's short name, v0.50.0) | identifiant court | a sign-in provider's "Short name" stays *nom court* |
| link / unlink (a storage to a tenant, v0.50.0) | associer / dissocier | audit nouns *association* / *dissociation d’un stockage* |
| Tools (maintenance page, v0.50.0) | Outils | "Thumbnail repair" → *Réparation des miniatures* |
| SSO identity / bound to it / SSO bind (v0.50.0) | identité SSO / liée à elle / liaison SSO | "Remove SSO bind" → *Supprimer la liaison SSO*; an account whose first SSO sign-in fixed its identity refuses another identity with the same address |
| waiting for approval / approve and switch on (an account opened switched off by SSO, v0.50.0) | en attente d’approbation / approuver et activer | the security hints (*trust_email*, *show_refusal_reason*) keep every condition of the English: what stays off, who can then sign in to what |

**v0.49.0 (roles and permissions) — notes:**

- `server.perm.denied.*`: `{action}` is a lowercase infinitive phrase (*supprimer des fichiers*). The negative sentences say *autorisé à {action}*, never *de {action}*, which would need elision before *utiliser*, *ajouter*, *étiqueter*, *exécuter*. The infinitive's subject is always third person (*votre compte*, *un administrateur*, *un compte*), so the reflexive *se connecter* reads right in all 168 renderings. `override` quotes the phrase as the permission's name: *l’autorisation « {action} »*.
- Audit verbs stay nouns: *Utilisateur : changement de rôle*, *Utilisateur : modification des exceptions*, *Rôle intégré : modification des autorisations*, *Demande d’extension : clôture après modification de sa source*.
- `permissions.customBadge` is *Avec exceptions*: plain *Exceptions* is identical to the English, and `validate-fr.mjs` reports that as an ERROR.
- The REGISTER warnings on *Demande d’…* are false positives. It is the noun, not a *tu* imperative.

**v0.50.0 (pre-release: sign-in security, operating-system accounts, realms and groups) - notes:**

- `server.login.failed_remaining*`: `{limit}` is the number of the failed attempt at which the lock falls. *à la tentative échouée n° {limit}* reads right for every number; an ordinal (*{limit}e*) would be wrong for 1. The `_one` forms keep `{count}` (French `one` is 0 and 1: *Il vous reste 0 tentative*).
- `server.login.wait_minutes` / `_one` are *{count} minutes* / *{count} minute*, the same as the English: *minute* is in `validate-fr.mjs`'s KEEP_WORDS.
- `server.perm.denied.rule_group` / `role_off_group` keep the v0.49.0 pattern (*n’autorise pas votre compte à {action}*, *votre compte n’est donc pas autorisé à {action}*); the group comes in as *que vous avez via le groupe « {group} »*.
- The PAM hints' code spans stay byte for byte, `<user>` included: a token inside a command the reader copies is part of the command, and `validate-fr.mjs` requires identical code spans. (The angle-token rule above is for prose syntax.)
- The new admin plurals keep three forms (`groups.members`, `groups.folders`, `permissions.rules.groups`, `permissions.rules.viaGroups`): *Aucun membre | {count} membre | {count} membres*.

## Decisions that were hard (and why)

- **upload → *téléverser*, download → *télécharger*.** France often says *télécharger* for both
  directions, and Google Drive says *importer*. In a file manager the two directions sit side by side
  in the same menus, so they must never share a word; *importer* is taken (Appearance → *Importer* a
  theme). *Téléverser* is the term WordPress and Nextcloud use in French — the self-hosted audience
  this product is for already reads it.
- **plugin → *extension*, app → *application*.** filex has two kinds of add-on: a storage plugin
  (a driver) and a WebAssembly app. *Module* was not free — an app's binary is literally its
  "Module (.wasm)" — so storage plugins are *extensions* and apps *applications*, keeping the split
  visible. The one place the English means a *file* extension ("Extensions" in an app's action
  overrides) is written *Extensions de fichier*.
- **share → *partage*, SMB share → *partage réseau*.** A share link is a *partage* / *lien de partage*;
  the SMB/CIFS network share is always qualified as *partage réseau*.
- **label ≠ tag.** *Étiquette* is reserved for tags, a user-facing feature. A token's / key's / export's
  "label" is *libellé*.
- **storage → *stockage*.** The term Nextcloud uses for mounted backends (*Stockage externe*); it fits
  the side nav in the plural, *Stockages*, and now the dashboard stat tile too. That tile used to
  be the one exception — *STOCKAGES* was 6 px wider than its 62 px label box — but v0.43.0 widened
  the card: measured again, the box is 72 px at 1024 px (the tightest breakpoint, six columns) and
  114 px at 1280 px, and *STOCKAGES* takes 68 px. It fits at every width, so there is no exception
  left and no abbreviation. ⚠ It was *Lecteurs* until then; that was the one place this pack
  called a storage a drive, and the release removed exactly that word from the English.
- **star → *favoris*.** Google Drive's French *Suivis* is opaque; *Favoris* is what every French file
  manager uses, and filex has no other "favourite" concept it could clash with.
- **token → *jeton*, claim → *claim*, endpoint/bucket kept.** *Jeton* is standard French (Microsoft,
  GitLab). *Claim*, *endpoint* and *bucket* are what the identity provider and the S3 console show the
  operator, word for word, on the screen they copy the value from.
- **Typography.** Non-breaking spaces are applied, because a French reader notices their absence and a
  line starting with « ? » looks broken. U+00A0 before `:` and inside guillemets, U+202F (narrow)
  before `;` `!` `?` — the Imprimerie nationale convention. They are inserted by a script, outside code,
  placeholders and syntax, so they cannot break a value the UI fills in.
- **Units → *Ko / Mo / Go*.** The explorer's size formatter takes its unit labels from the catalogue
  (`unit.*`), so French units show wherever sizes are formatted through it. (The admin panel's own
  formatter still prints "GB"/"TB" — see the README's platform notes.)
- **Plurals.** filex v0.43.0 picks a form by the **CLDR category** of the count in the reader's
  language (`Intl.PluralRules` in the browser, `x/text` on the server). French has two
  categories: **one** (0 *and* 1) and **other**.
  - *Admin panel* (`a | b | c`): the pack writes **three** forms, `zéro | un | plusieurs`.
    `pluralChoiceIndex` (`packages/core/src/lib/plural.ts`) routes a three-branch string as
    0 → branch 1, 1 → branch 2, anything else → branch 3, so the zero case can have wording of
    its own (*Aucun dossier trouvé.*). Two forms would also be legal and would send 0 to the
    singular, but the pack never mixes the two conventions: **every admin plural has three
    forms**.
  - *Explorer and server* (`key` / `key_one`): the plain key is the **other** form, and
    `key_one` is shown for **0 as well as 1**, because French `select(0)` is `one`. A `_one`
    form must therefore read correctly for both, and it **keeps the count placeholder** —
    `"{n} élément"`, never `"1 élément"`. (The old note that "a count of 0 there still takes
    the plural — a platform limit" is no longer true and has been removed.)
  - A `_one` form is added **only where the French words change**. These read the same for every
    count and deliberately have none: `opc.percent`, `tour.progress`, `viewer.counter`,
    `viewer.page_n_of_m`, `inspector.versions.v`, `inspector.activity.version`,
    `selection.count`, `sidenav.tags.more`, `tz.more`, `server.app.wake.beyond`,
    `archive.dictionary_size_value`.
- **Audit verbs are nouns.** `audit.phrase` is `{resource} : {verb}` and resources have both genders
  (*Corbeille*, *Règle de réplication* are feminine), so a participle would disagree half the time
  (*Corbeille : vidé*). Nouns never do: *Corbeille : vidage*, *Fichier : suppression*.
- **remove → *retirer*, delete → *supprimer*.** Detaching something that goes on existing elsewhere
  (a key, a tag, a storage from the list, a plugin, a stylesheet) is *retirer*; destroying data is
  *supprimer*.
- **Design tokens → *variables*.** "Tokens" in the Appearance screens are CSS custom properties; they
  are *variables du thème* so that *jeton* keeps meaning an authentication token.
- **Operating-system names are the French builds' own.** Windows: *Ce PC*, *Connecter un lecteur
  réseau…*, *Invite de commandes*, *Gestionnaire d'identification*. macOS: *Aller → Se connecter au
  serveur…*, *Réglages Système*, *Emplacements*. FileZilla/WinSCP/Cyberduck option names the translators
  were not sure of stay in English inside « » (*Use virtual host style*, *Require explicit FTP over
  TLS*). **A reviewer should check these against current French builds.**

## Length fixes (measured in the browser, v0.43.0 build, 1280 px and 390 px)

| Where | English | First French | Shipped | Why |
|---|---|---|---|---|
| Dashboard tile | Users | Utilisateurs | *Comptes* | 81 px in a 62 px label box — ran into the tile border |
| Dashboard tile | Storages | Stockages | *Lecteurs* | 68 px in 62 px |
| Dashboard tile | Active syncs | Synchros actives | *Synchro. actives* | *SYNCHROS* 64 px in 62 px |
| Storage card chip | Never ran | Jamais exécuté | *Jamais lancé* (U+00A0 between the words) | wrapped to two lines; the NBSP keeps the chip on one line, and the card still fits |
| Storage card chip | Periodic poll / Live watch | Scrutation périodique / Surveillance en direct | *Périodique* / *Temps réel* | the chip squeezed the storage name into an ellipsis that English does not show |
| Explorer side nav | How to connect | Comment se connecter | *Guide de connexion* | 136 px in 125 px, cut with an ellipsis |

Checked and fine as translated: the admin side nav (widest item *Historique des fichiers*, 141 px of
~180 px), the login page at 1280 and 390 px, the dashboard at 390 px (no horizontal page scroll;
tables scroll inside their cards exactly as in English), and the storages, users, audit, sync runs,
plugins/apps, settings, protection, queue, shares, auth providers, trash, webhooks, replication,
appearance, connections, updates, about and usage screens (no text overflow reported).
