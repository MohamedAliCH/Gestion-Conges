import { useState, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'

const fmt = (n) =>
  Number(n).toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DT'

export default function EmployeFichePaie() {
  const [payslips, setPayslips] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/employe/fiche-paie')
      .then(res => {
        setPayslips(res.data)
        if (res.data.length > 0) setSelected(0)
      })
      .catch(() => setError('Impossible de charger les fiches de paie.'))
      .finally(() => setLoading(false))
  }, [])

  const slip = selected !== null ? payslips[selected] : null

  const handlePrint = () => {
    if (!slip) return
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Fiche de Paie — ${slip.period}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 36px; color: #222; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c0392b; padding-bottom: 14px; margin-bottom: 20px; }
    .header .company h2 { margin: 0 0 2px; font-size: 20px; color: #c0392b; }
    .header .company p { margin: 0; color: #666; font-size: 12px; }
    .header .meta { text-align: right; }
    .header .meta .period { font-size: 15px; font-weight: bold; }
    .header .meta p { margin: 3px 0; color: #555; font-size: 12px; }
    .section-title { background: #f0f0f0; padding: 6px 10px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: #444; margin: 16px 0 6px; border-left: 3px solid #c0392b; }
    table.info { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    table.info tr td { padding: 4px 8px; font-size: 12px; vertical-align: top; }
    table.info tr td:first-child { color: #777; width: 45%; }
    table.info tr td:last-child { font-weight: 500; }
    table.pay { width: 100%; border-collapse: collapse; }
    table.pay thead th { background: #333; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
    table.pay thead th:last-child { text-align: right; }
    table.pay tbody td { padding: 7px 12px; border-bottom: 1px solid #eee; font-size: 12px; }
    table.pay tbody td:last-child { text-align: right; }
    .sub { color: #888; font-size: 11px; padding-left: 24px !important; }
    .deduction { color: #c0392b; }
    .total-row td { background: #fafafa; font-weight: bold; border-top: 2px solid #ccc; }
    .net-row td { background: #1a6e2e; color: #fff !important; font-weight: bold; font-size: 14px; padding: 10px 12px !important; }
    .signature { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature .sig-box { border-top: 1px solid #ccc; padding-top: 8px; width: 180px; font-size: 11px; color: #777; }
    .footer { margin-top: 24px; font-size: 10px; color: #bbb; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h2>IntraCongés</h2>
      <p>Système de Gestion des Ressources Humaines</p>
      <p style="margin-top:6px;color:#333">Employeur : IntraCongés S.A.</p>
    </div>
    <div class="meta">
      <div class="period">BULLETIN DE PAIE</div>
      <p>${slip.period}</p>
      <p>Période : 01/${String(slip.month).padStart(2,'0')}/${slip.year} – ${new Date(slip.year, slip.month, 0).getDate()}/${String(slip.month).padStart(2,'0')}/${slip.year}</p>
    </div>
  </div>

  <div class="section-title">Informations Employé</div>
  <table class="info">
    <tr>
      <td>Nom &amp; Prénom</td><td><strong>${slip.employeeFirstName} ${slip.employeeLastName}</strong></td>
      <td>CIN</td><td>${slip.cin || '—'}</td>
    </tr>
    <tr>
      <td>Poste</td><td>${slip.poste || '—'}</td>
      <td>Département</td><td>${slip.departement || '—'}</td>
    </tr>
    <tr>
      <td>Email</td><td>${slip.email}</td>
      <td>Téléphone</td><td>${slip.phone || '—'}</td>
    </tr>
    <tr>
      <td>Date d'embauche</td><td>${slip.dateEmbauche || '—'}</td>
      <td></td><td></td>
    </tr>
  </table>

  <div class="section-title">Rémunération</div>
  <table class="pay">
    <thead><tr><th>Élément</th><th>Base / Taux</th><th>Montant</th></tr></thead>
    <tbody>
      <tr><td>Salaire de base</td><td>—</td><td>${fmt(slip.brut)}</td></tr>
      <tr class="total-row"><td>Total Brut</td><td></td><td>${fmt(slip.brut)}</td></tr>
    </tbody>
  </table>

  <div class="section-title">Cotisations Sociales &amp; Impôts</div>
  <table class="pay">
    <thead><tr><th>Élément</th><th>Taux</th><th>Montant</th></tr></thead>
    <tbody>
      <tr><td class="deduction" colspan="3" style="font-weight:bold;background:#fff5f5">CNSS — Cotisations employé (9,18 %)</td></tr>
      <tr class="deduction"><td class="sub">↳ Pension vieillesse</td><td>4,74 %</td><td>− ${fmt(slip.cnssRetraite)}</td></tr>
      <tr class="deduction"><td class="sub">↳ Assurance maladie (CNAM)</td><td>3,94 %</td><td>− ${fmt(slip.cnssAssuranceMaladie)}</td></tr>
      <tr class="deduction"><td class="sub">↳ Accidents du travail</td><td>0,50 %</td><td>− ${fmt(slip.cnssAccidentsTravail)}</td></tr>
      <tr class="deduction total-row"><td>Total CNSS</td><td>9,18 %</td><td>− ${fmt(slip.cnss)}</td></tr>
      <tr class="deduction"><td>IRPP (Impôt sur le revenu)</td><td>Barème progressif</td><td>− ${fmt(slip.irpp)}</td></tr>
      <tr class="total-row deduction"><td>Total Retenues</td><td></td><td>− ${fmt(slip.totalRetenues)}</td></tr>
    </tbody>
  </table>

  <table class="pay" style="margin-top:8px">
    <tbody>
      <tr class="net-row"><td>NET À PAYER</td><td></td><td>${fmt(slip.net)}</td></tr>
    </tbody>
  </table>

  <div class="signature">
    <div class="sig-box">Signature Employeur</div>
    <div class="sig-box" style="text-align:right">Signature Employé</div>
  </div>

  <div class="footer">
    Document généré automatiquement par IntraCongés RH &nbsp;·&nbsp; ${slip.period} &nbsp;·&nbsp; Confidentiel
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`
    const win = window.open('', '_blank', 'width=850,height=700')
    win.document.write(html)
    win.document.close()
  }

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger mt-4">{error}</div>
      </div>
    )
  }

  if (payslips.length === 0) {
    return (
      <div className="container-fluid">
        <div className="alert alert-info mt-4">
          Aucune fiche de paie disponible. Votre salaire n'est pas encore renseigné.
        </div>
      </div>
    )
  }

  const currentSlip = payslips[0]
  const summaryCards = [
    { label: 'Salaire Brut', value: fmt(currentSlip.brut), sub: 'Mois en cours', color: 'primary', icon: 'ti-cash' },
    { label: 'CNSS + IRPP', value: fmt(currentSlip.totalRetenues), sub: 'Total retenues', color: 'danger', icon: 'ti-minus' },
    { label: 'Salaire Net', value: fmt(currentSlip.net), sub: 'Montant versé', color: 'success', icon: 'ti-wallet' },
  ]

  return (
    <>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fs-3 mb-1">Fiche de Paie</h1>
            <p className="text-secondary mb-0">Consultez vos détails de salaire et fiches de paie</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          {summaryCards.map(c => (
            <div key={c.label} className="col-12 col-sm-4">
              <div className={`card p-4 bg-${c.color} bg-opacity-10 border border-${c.color} border-opacity-25`}>
                <div className="d-flex gap-3">
                  <div className={`icon-shape icon-md bg-${c.color} text-white rounded-2`}>
                    <i className={`ti ${c.icon} fs-4`} />
                  </div>
                  <div>
                    <h6 className="mb-2">{c.label}</h6>
                    <h3 className="fw-bold mb-0">{c.value}</h3>
                    <p className={`text-${c.color} mb-0 small`}>{c.sub}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          {/* Detail card */}
          <div className="col-12 col-lg-5">
            <div className="card h-100">
              <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Détail de la Fiche de Paie</h5>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={selected ?? 0}
                  onChange={e => setSelected(Number(e.target.value))}
                >
                  {payslips.map((s, i) => (
                    <option key={i} value={i}>{s.period}</option>
                  ))}
                </select>
              </div>
              {slip && (
                <div className="card-body p-4">
                  {[
                    ['Employé', `${slip.employeeFirstName} ${slip.employeeLastName}`],
                    ['Poste', slip.poste || '—'],
                    ['Département', slip.departement || '—'],
                    ['CIN', slip.cin || '—'],
                    ['Téléphone', slip.phone || '—'],
                    ['Période', slip.period],
                  ].map(([label, val]) => (
                    <div key={label} className="d-flex justify-content-between border-bottom pb-2 mb-2">
                      <span className="text-secondary small">{label}</span>
                      <span className="fw-medium small">{val}</span>
                    </div>
                  ))}

                  <div className="mt-3 mb-1 small fw-semibold text-uppercase text-secondary">Rémunération</div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-secondary small">Salaire brut</span>
                    <span className="fw-medium small">{fmt(slip.brut)}</span>
                  </div>

                  <div className="mt-2 mb-1 small fw-semibold text-uppercase text-secondary">Retenues</div>
                  {[
                    ['CNSS — Pension vieillesse (4,74 %)', slip.cnssRetraite],
                    ['CNSS — Assurance maladie CNAM (3,94 %)', slip.cnssAssuranceMaladie],
                    ['CNSS — Accidents du travail (0,50 %)', slip.cnssAccidentsTravail],
                    ['IRPP (barème progressif)', slip.irpp],
                  ].map(([label, val]) => (
                    <div key={label} className="d-flex justify-content-between border-bottom pb-2 mb-2">
                      <span className="text-secondary small">{label}</span>
                      <span className="fw-medium small text-danger">− {fmt(val)}</span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                    <span className="fw-semibold small">Total retenues</span>
                    <span className="fw-semibold small text-danger">− {fmt(slip.totalRetenues)}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4 p-2 rounded" style={{ background: '#e8f5e9' }}>
                    <span className="fw-bold">NET À PAYER</span>
                    <span className="fw-bold text-success fs-5">{fmt(slip.net)}</span>
                  </div>

                  <button className="btn btn-outline-primary w-100" onClick={handlePrint}>
                    <i className="ti ti-printer me-2" />
                    Télécharger / Imprimer PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* History table */}
          <div className="col-12 col-lg-7">
            <div className="card">
              <div className="card-header bg-white px-4 py-3">
                <h5 className="mb-0">Historique des Fiches de Paie</h5>
              </div>
              <div className="table-responsive">
                <table className="table mb-0 table-hover text-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Période</th>
                      <th>Brut</th>
                      <th>CNSS</th>
                      <th>Net Payé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((s, i) => (
                      <tr
                        key={i}
                        className={`align-middle${selected === i ? ' table-active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(i)}
                      >
                        <td className="fw-medium">{s.period}</td>
                        <td>{fmt(s.brut)}</td>
                        <td className="text-danger">− {fmt(s.cnss)}</td>
                        <td className="fw-semibold text-success">{fmt(s.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
