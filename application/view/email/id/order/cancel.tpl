{'STORE_NAME'|config} Order Dibatalkan
Yth. Bapak/Ibu {$user.fullName},

Order Anda #{$order.ID}, di {'STORE_NAME'|config}, telah dibatalkan.

Jika Anda memiliki pertanyaan seputar order anda, maka Anda dapat mengirimkan e-mail kepada kami atau hubungi kami melalui halaman berikut:
{link controller=user action=viewOrder id=$order.ID url=true}

Barang pada order yang dibatalkan:
{include file="email/blockOrderItems.tpl"}

{include file="email/en/signature.tpl"}