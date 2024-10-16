package utils

type Currency struct {
	Flag    string `json:"flag"`
	Country string `json:"country"`
	Name    string `json:"name"`
	Code    string `json:"code"`
	Symbol  string `json:"symbol"`
	Locale  string `json:"locale"`
}

var AccountGroups = []string{
	"💵 Cash",
	"🏦 Bank Account",
	"💰 Savings",
	"📈 Investment",
	"💳 Credit Card",
	"💸 Loan",
	"📱 Mobile Money",
	"💼 Other",
}

var TransactionTypes = []string{
	"🍲 Food",
	"🚗 Transport",
	"🏠 Rent",
	"💡 Utilities",
	"📱 Phone",
	"💻 Internet",
	"🛒 Groceries",
	"👗 Clothing",
	"🏥 Healthcare",
	"💊 Medications",
	"🎓 Education",
	"📚 Books",
	"🎉 Entertainment",
	"🍿 Movies",
	"🎮 Games",
	"🏋️ Gym",
	"✈️ Travel",
	"🏖️ Vacation",
	"🎁 Gifts",
	"💼 Work",
	"📈 Investments",
	"💳 Credit Card",
	"🏦 Savings",
	"🚿 Personal Care",
	"🐾 Pet Care",
	"🛠️ Maintenance",
	"🛏️ Furniture",
	"🖼️ Decor",
	"🧹 Cleaning",
	"🛡️ Insurance",
	"🚨 Security",
	"📦 Subscriptions",
	"💸 Miscellaneous",
	"💰 Wages",
}

var Currencies = []Currency{
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/albania.png", Country: "Albania", Name: "Lek", Code: "ALL", Symbol: "Lek", Locale: "sq-AL"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/afghanistan.png", Country: "Afghanistan", Name: "Afghani", Code: "AFN", Symbol: "؋", Locale: "uz-Arab-AF"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/argentina.png", Country: "Argentina", Name: "Peso", Code: "ARS", Symbol: "$", Locale: "es-AR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/aruba.png", Country: "Aruba", Name: "Guilder", Code: "AWG", Symbol: "ƒ", Locale: "nl-AW"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/australia.png", Country: "Australia", Name: "Dollar", Code: "AUD", Symbol: "$", Locale: "en-AU"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/azerbaijan.png", Country: "Azerbaijan", Name: "Manat", Code: "AZN", Symbol: "₼", Locale: "az-Cyrl-AZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/bahamas.png", Country: "Bahamas", Name: "Dollar", Code: "BSD", Symbol: "$", Locale: "en-BS"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/barbados.png", Country: "Barbados", Name: "Dollar", Code: "BBD", Symbol: "$", Locale: "en-BB"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/belarus.png", Country: "Belarus", Name: "Ruble", Code: "BYR", Symbol: "p.", Locale: "ru-BY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/belize.png", Country: "Belize", Name: "Dollar", Code: "BZD", Symbol: "BZ$", Locale: "en-BZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/bermuda.png", Country: "Bermuda", Name: "Dollar", Code: "BMD", Symbol: "$", Locale: "en-BM"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/bolivia.png", Country: "Bolivia", Name: "Boliviano", Code: "BOB", Symbol: "$b", Locale: "es-BO"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/Bosnia_and_Herzegovina.png", Country: "Bosnia and Herzegovina", Name: "Convertible Marka", Code: "BAM", Symbol: "KM", Locale: "bs-Latn-BA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/botswana.png", Country: "Botswana", Name: "Pula", Code: "BWP", Symbol: "P", Locale: "en-BW"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/bulgaria.png", Country: "Bulgaria", Name: "Lev", Code: "BGN", Symbol: "лв", Locale: "bg-BG"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/brazil.png", Country: "Brazil", Name: "Real", Code: "BRL", Symbol: "R$", Locale: "pt-BR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/brunei.png", Country: "Brunei", Name: "Darussalam Dollar", Code: "BND", Symbol: "$", Locale: "ms-BN"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/cambodia.png", Country: "Cambodia", Name: "Riel", Code: "KHR", Symbol: "៛", Locale: "km-KH"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/canada.png", Country: "Canada", Name: "Dollar", Code: "CAD", Symbol: "$", Locale: "en-CA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/Cayman_Islands.png", Country: "Cayman", Name: "Dollar", Code: "KYD", Symbol: "$", Locale: "en-KY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/chile.png", Country: "Chile", Name: "Peso", Code: "CLP", Symbol: "$", Locale: "es-CL"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/china.png", Country: "China", Name: "Yuan Renminbi", Code: "CNY", Symbol: "¥", Locale: "zh-CN"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/colombia.png", Country: "Colombia", Name: "Peso", Code: "COP", Symbol: "$", Locale: "es-CO"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/costarica.png", Country: "Costa Rica", Name: "Colon", Code: "CRC", Symbol: "₡", Locale: "es-CR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/croatia.png", Country: "Croatia", Name: "Kuna", Code: "HRK", Symbol: "kn", Locale: "hr-HR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/cuba.png", Country: "Cuba", Name: "Peso", Code: "CUP", Symbol: "₱", Locale: "cu"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/czechrepublic.png", Country: "Czech Republic", Name: "Koruna", Code: "CZK", Symbol: "Kč", Locale: "cs-CZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/denmark.png", Country: "Denmark", Name: "Krone", Code: "DKK", Symbol: "kr", Locale: "en-DK"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/dominicanrepublic.png", Country: "Dominican Republic", Name: "Peso", Code: "DOP", Symbol: "RD$", Locale: "es-DO"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/egypt.png", Country: "Egypt", Name: "Pound", Code: "EGP", Symbol: "£", Locale: "ar-EG"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/elsalvador.png", Country: "El Salvador", Name: "Colon", Code: "SVC", Symbol: "$", Locale: "es-SV"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/estonia.png", Country: "Estonia", Name: "Kroon", Code: "EEK", Symbol: "kr", Locale: "et-EE"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/euro.png", Country: "Euro Member", Name: "Euro", Code: "EUR", Symbol: "€", Locale: "eu"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/falklandislands.png", Country: "Falkland Islands", Name: "Pound", Code: "FKP", Symbol: "£", Locale: "en-FK"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/fiji.png", Country: "Fiji", Name: "Dollar", Code: "FJD", Symbol: "$", Locale: "en-FJ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/georgia.png", Country: "Georgia", Name: "Lari", Code: "GEL", Symbol: "₾", Locale: "os-GE"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/ghana.png", Country: "Ghana", Name: "Cedis", Code: "GHS", Symbol: "¢", Locale: "en-GH"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/gibraltar.png", Country: "Gibraltar", Name: "Pound", Code: "GIP", Symbol: "£", Locale: "en-GI"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/guatemala.png", Country: "Guatemala", Name: "Quetzal", Code: "GTQ", Symbol: "Q", Locale: "es-GT"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/guernsey.png", Country: "Guernsey", Name: "Pound", Code: "GGP", Symbol: "£", Locale: "en-GG"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/guyana.png", Country: "Guyana", Name: "Dollar", Code: "GYD", Symbol: "$", Locale: "es-GY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/honduras.png", Country: "Honduras", Name: "Lempira", Code: "HNL", Symbol: "L", Locale: "es-HN"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/hongkong.png", Country: "Hong Kong", Name: "Dollar", Code: "HKD", Symbol: "$", Locale: "en-HK"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/hungary.png", Country: "Hungary", Name: "Forint", Code: "HUF", Symbol: "Ft", Locale: "hu-HU"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/iceland.png", Country: "Iceland", Name: "Krona", Code: "ISK", Symbol: "kr", Locale: "is-IS"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/india.png", Country: "India", Name: "Rupee", Code: "INR", Symbol: "₹", Locale: "en-IN"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/indonesia.png", Country: "Indonesia", Name: "Rupiah", Code: "IDR", Symbol: "Rp", Locale: "id-ID"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/iran.png", Country: "Iran", Name: "Rial", Code: "IRR", Symbol: "﷼", Locale: "fa-IR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/isleofman.png", Country: "Isle of Man", Name: "Pound", Code: "IMP", Symbol: "£", Locale: "en-IM"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/israel.png", Country: "Israel", Name: "Shekel", Code: "ILS", Symbol: "₪", Locale: "en-IL"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/jamaica.png", Country: "Jamaica", Name: "Dollar", Code: "JMD", Symbol: "J$", Locale: "en-JM"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/japan.png", Country: "Japan", Name: "Yen", Code: "JPY", Symbol: "¥", Locale: "ja-JP"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/jersey.png", Country: "Jersey", Name: "Pound", Code: "JEP", Symbol: "£", Locale: "en-JE"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/kazakhstan.png", Country: "Kazakhstan", Name: "Tenge", Code: "KZT", Symbol: "лв", Locale: "ru-KZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/northkorea.png", Country: "Korea (North)", Name: "Won", Code: "KPW", Symbol: "₩", Locale: "ko-KP"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/southkorea.png", Country: "Korea (South)", Name: "Won", Code: "KRW", Symbol: "₩", Locale: "ko-KR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/kyrgyzstan.png", Country: "Kyrgyzstan", Name: "Som", Code: "KGS", Symbol: "лв", Locale: "ky-KG"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/laos.png", Country: "Laos", Name: "Kip", Code: "LAK", Symbol: "₭", Locale: "la"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/latvia.png", Country: "Latvia", Name: "Lat", Code: "LVL", Symbol: "Ls", Locale: "lv"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/lebanon.png", Country: "Lebanon", Name: "Pound", Code: "LBP", Symbol: "£", Locale: "ar-LB"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/liberia.png", Country: "Liberia", Name: "Dollar", Code: "LRD", Symbol: "$", Locale: "en-LR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/lithuania.png", Country: "Lithuania", Name: "Litas", Code: "LTL", Symbol: "Lt", Locale: "lt-LT"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/macedonia.png", Country: "Macedonia", Name: "Denar", Code: "MKD", Symbol: "ден", Locale: "mk"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/malaysia.png", Country: "Malaysia", Name: "Ringgit", Code: "MYR", Symbol: "RM", Locale: "ms-MY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/mauritius.png", Country: "Mauritius", Name: "Rupee", Code: "MUR", Symbol: "₨", Locale: "en-MU"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/mexico.png", Country: "Mexico", Name: "Peso", Code: "MXN", Symbol: "$", Locale: "es-MX"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/mongolia.png", Country: "Mongolia", Name: "Tughrik", Code: "MNT", Symbol: "₮", Locale: "mn-MN"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/mozambique.png", Country: "Mozambique", Name: "Metical", Code: "MZN", Symbol: "MT", Locale: "pt-MZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/namibia.png", Country: "Namibia", Name: "Dollar", Code: "NAD", Symbol: "$", Locale: "en-NA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/nepal.png", Country: "Nepal", Name: "Rupee", Code: "NPR", Symbol: "₨", Locale: "ne-NP"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/netherlands.png", Country: "Netherlands", Name: "Antilles Guilder", Code: "ANG", Symbol: "ƒ", Locale: "nl-NL"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/newzealand.png", Country: "New Zealand", Name: "Dollar", Code: "NZD", Symbol: "$", Locale: "en-NZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/nicaragua.png", Country: "Nicaragua", Name: "Cordoba", Code: "NIO", Symbol: "C$", Locale: "es-NI"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/nigeria.png", Country: "Nigeria", Name: "Naira", Code: "NGN", Symbol: "₦", Locale: "ig-NG"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/norway.png", Country: "Norway", Name: "Krone", Code: "NOK", Symbol: "kr", Locale: "nb-NO"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/oman.png", Country: "Oman", Name: "Rial", Code: "OMR", Symbol: "﷼", Locale: "ar-OM"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/pakistan.png", Country: "Pakistan", Name: "Rupee", Code: "PKR", Symbol: "₨", Locale: "en-PK"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/panama.png", Country: "Panama", Name: "Balboa", Code: "PAB", Symbol: "B/.", Locale: "es-PA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/paraguay.png", Country: "Paraguay", Name: "Guarani", Code: "PYG", Symbol: "Gs", Locale: "es-PY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/peru.png", Country: "Peru", Name: "Nuevo Sol", Code: "PEN", Symbol: "S/.", Locale: "es-PE"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/philippines.png", Country: "Philippines", Name: "Peso", Code: "PHP", Symbol: "₱", Locale: "en-PH"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/poland.png", Country: "Poland", Name: "Zloty", Code: "PLN", Symbol: "zł", Locale: "pl-PL"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/qatar.png", Country: "Qatar", Name: "Riyal", Code: "QAR", Symbol: "﷼", Locale: "ar-QA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/romania.png", Country: "Romania", Name: "New Leu", Code: "RON", Symbol: "lei", Locale: "ro-RO"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/russia.png", Country: "Russia", Name: "Ruble", Code: "RUB", Symbol: "₽", Locale: "ru-RU"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/sainthelena.png", Country: "Saint Helena", Name: "Pound", Code: "SHP", Symbol: "£", Locale: "ens-SH"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/saudiarabia.png", Country: "Saudi Arabia", Name: "Riyal", Code: "SAR", Symbol: "﷼", Locale: "ar-SA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/serbia.png", Country: "Serbia", Name: "Dinar", Code: "RSD", Symbol: "Дин.", Locale: "sr-Latn-RS"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/seychelles.png", Country: "Seychelles", Name: "Rupee", Code: "SCR", Symbol: "₨", Locale: "en-SC"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/singapore.png", Country: "Singapore", Name: "Dollar", Code: "SGD", Symbol: "$", Locale: "ms-SG"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/solomonislands.png", Country: "Solomon Islands", Name: "Dollar", Code: "SBD", Symbol: "$", Locale: "en-SB"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/somalia.png", Country: "Somalia", Name: "Shilling", Code: "SOS", Symbol: "S", Locale: "so-SO"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/southafrica.png", Country: "South Africa", Name: "Rand", Code: "ZAR", Symbol: "R", Locale: "en-ZA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/srilanka.png", Country: "Sri Lanka", Name: "Rupee", Code: "LKR", Symbol: "₨", Locale: "ta-LK"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/sweden.png", Country: "Sweden", Name: "Krona", Code: "SEK", Symbol: "kr", Locale: "sv-SE"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/switzerland.png", Country: "Switzerland", Name: "Franc", Code: "CHF", Symbol: "CHF", Locale: "en-CH"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/suriname.png", Country: "Suriname", Name: "Dollar", Code: "SRD", Symbol: "$", Locale: "nl-SR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/syria.png", Country: "Syria", Name: "Pound", Code: "SYP", Symbol: "£", Locale: "ar-SY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/taiwan.png", Country: "Taiwan", Name: "New Dollar", Code: "TWD", Symbol: "NT$", Locale: "zh-Hant-TW"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/thailand.png", Country: "Thailand", Name: "Baht", Code: "THB", Symbol: "฿", Locale: "th-TH"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/trinidadandtobago.png", Country: "Trinidad and Tobago", Name: "Dollar", Code: "TTD", Symbol: "TT$", Locale: "en-TT"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/turkey.png", Country: "Turkey", Name: "Lira", Code: "TRL", Symbol: "₺", Locale: "tr-TR"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/tuvalu.png", Country: "Tuvalu", Name: "Dollar", Code: "TVD", Symbol: "$", Locale: "en-TV"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/ukraine.png", Country: "Ukraine", Name: "Hryvna", Code: "UAH", Symbol: "₴", Locale: "uk-UA"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/unitedkingdom.png", Country: "United Kingdom", Name: "Pound", Code: "GBP", Symbol: "£", Locale: "en-GB"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/unitedstates.png", Country: "United States", Name: "Dollar", Code: "USD", Symbol: "$", Locale: "en-US"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/uruguay.png", Country: "Uruguay", Name: "Peso", Code: "UYU", Symbol: "$U", Locale: "es-UY"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/uzbekistan.png", Country: "Uzbekistan", Name: "Som", Code: "UZS", Symbol: "лв", Locale: "uz-Latn-UZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/venezuela.png", Country: "Venezuela", Name: "Bolivar Fuerte", Code: "VEF", Symbol: "Bs", Locale: "az-Cyrl-AZ"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/vietnam.png", Country: "Viet Nam", Name: "Dong", Code: "VND", Symbol: "₫", Locale: "vi-VN"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/yemen.png", Country: "Yemen", Name: "Rial", Code: "YER", Symbol: "﷼", Locale: "ar-YE"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/sambia.png", Country: "Zambia", Name: "Kwacha", Code: "ZMW", Symbol: "ZK", Locale: "en-ZW"},
	{Flag: "https://www.currencyremitapp.com/wp-content/themes/currencyremitapp/images/countryimages/zimbabwe.png", Country: "Zimbabwe", Name: "Dollar", Code: "ZWD", Symbol: "Z$", Locale: "en-ZW"}}
