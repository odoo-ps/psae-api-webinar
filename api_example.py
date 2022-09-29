import xmlrpc.client

"""
Fetch data
"""

import pandas as pd

url = "http://127.0.0.1:8069"
db = "test_api"
username = "admin"
password = "admin"



common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db,username,password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

domain = [('display_type', 'not in', ('line_section', 'line_note')), ("account_id.user_type_id.type", "in", ("receivable", "payable")), ("move_id.state", "=", "posted")]

fields = ["move_name", "date", "debit", "credit", "amount_currency", "currency_id", "name", "partner_id"]

items = models.execute_kw(db, uid, password, 'account.move.line', 'search_read', [domain, fields])


items = [{**item, 'currency_id': item["currency_id"][1], 'partner_id': item["partner_id"][1]} for item in items]

df = pd.DataFrame.from_dict(items)

df.groupby(["partner_id", "currency_id"])[["debit","credit","amount_currency"]].sum()





"""
Add invoice to
sales order
"""

context = {
    "active_model": 'sale.order',
    "active_ids": [22],
    "active_id": 22,
}

wizard_id = models.execute_kw(db, uid, password, 'sale.advance.payment.inv', 'create', [{'advance_payment_method': 'delivered'}], {'context': context})

models.execute_kw(db, uid, password, 'sale.advance.payment.inv', 'create_invoices', [[wizard_id]], {'context': context})


