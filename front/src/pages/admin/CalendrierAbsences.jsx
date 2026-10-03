import { useState } from 'react'
import { useEmploye } from '@/context/EmployeContext'
import Footer from '@/components/layout/Footer'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const TYPE_COLOR = {
  'Congé annuel': 'primary',
  'Congé maladie': 'danger',
  'Congé personnel': 'warning',
  'RTT': 'info',
  'Congé maternité': 'info',
}

function isoToDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dateIsInRange(year, month, day, du, au) {
  const date = new Date(year, month, day)
  return date >= isoToDate(du) && date <= isoToDate(au)
}

function firstDayMon(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

export default function CalendrierAbsences() {
  const { conges } = useEmploye()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const approuvedConges = conges.filter(c => c.statut === 'Approuvé' || c.statut === 'En attente')
  const approvedOnly = conges.filter(c => c.statut === 'Approuvé')

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDayMon(year, month)

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const absencesForDay = day =>
    approuvedConges.filter(c => dateIsInRange(year, month, day, c.du, c.au))

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalAbsenceDays = approuvedConges
    .filter(c => {
      const from = isoToDate(c.du)
      const to = isoToDate(c.au)
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0)
      return from <= end && to >= start
    }).length

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Calendrier des absences</h1>
          <p className="text-secondary mb-0">Vue globale de toutes les absences approuvées et en attente</p>
        </div>
      </div>

      {/* Legend */}
      <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
        <small className="text-secondary fw-medium">Légende :</small>
        <span className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 14, borderRadius: 3, display: 'inline-block', background: 'rgba(108,117,125,0.15)', border: '1px solid #6c757d' }} />
          <small>1 employé absent</small>
        </span>
        <span className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 14, borderRadius: 3, display: 'inline-block', background: 'rgba(220,53,69,0.15)', border: '1px solid #dc3545' }} />
          <small>2 employés absents (complet)</small>
        </span>
        <span className="d-flex align-items-center gap-1 ms-auto">
          <small className="text-secondary">{totalAbsenceDays} absence(s) ce mois</small>
        </span>
      </div>

      {/* Calendar card */}
      <div className="card mb-4">
        {/* Navigation */}
        <div className="card-header bg-white px-4 py-3 d-flex align-items-center justify-content-between">
          <button className="btn btn-light btn-sm" onClick={prevMonth}>
            <i className="ti ti-chevron-left" />
          </button>
          <h5 className="mb-0 fw-semibold">{MOIS_FR[month]} {year}</h5>
          <button className="btn btn-light btn-sm" onClick={nextMonth}>
            <i className="ti ti-chevron-right" />
          </button>
        </div>

        <div className="card-body p-3">
          {/* Day headers */}
          <div className="row g-1 mb-1">
            {JOURS.map(j => (
              <div key={j} className="col text-center">
                <small className="text-secondary fw-medium">{j}</small>
              </div>
            ))}
          </div>

          {/* Grid — rows of 7 */}
          {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, rowIdx) => (
            <div key={rowIdx} className="row g-1 mb-1">
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                if (day === null) return (
                  <div key={`empty-${colIdx}`} className="col" style={{ minHeight: 80 }} />
                )
                const absences = absencesForDay(day)
                const approvedCount = approvedOnly.filter(c => dateIsInRange(year, month, day, c.du, c.au)).length
                const isToday =
                  day === now.getDate() &&
                  month === now.getMonth() &&
                  year === now.getFullYear()

                let cellClass = 'border-light'
                if (isToday) cellClass = 'border-primary bg-primary bg-opacity-10'
                else if (approvedCount >= 2) cellClass = 'border-danger bg-danger bg-opacity-10'
                else if (approvedCount === 1) cellClass = 'border-secondary bg-secondary bg-opacity-10'

                return (
                  <div key={day} className="col" style={{ minHeight: 80 }}>
                    <div className={`border rounded-2 p-1 h-100 ${cellClass}`}>
                      <div className={`small fw-medium mb-1 ${isToday ? 'text-primary' : 'text-secondary'}`}>
                        {day}
                      </div>
                      {absences.map((a, i) => (
                        <div key={i}
                          className={`badge bg-${TYPE_COLOR[a.type] ?? 'secondary'} w-100 text-start mb-1`}
                          style={{ fontSize: '0.65rem', whiteSpace: 'normal', lineHeight: 1.2 }}
                          title={`${a.employeNom} — ${a.type}`}
                        >
                          {a.employeNom.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {/* Pad last row */}
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).length < 7 &&
                Array.from({ length: 7 - cells.slice(rowIdx * 7, rowIdx * 7 + 7).length }).map((_, i) => (
                  <div key={`pad-${i}`} className="col" style={{ minHeight: 80 }} />
                ))
              }
            </div>
          ))}
        </div>
      </div>

      {/* Absence list for the month */}
      <div className="card mb-4">
        <div className="card-header bg-white px-4 py-3">
          <h5 className="mb-0">Absences du mois — {MOIS_FR[month]} {year}</h5>
        </div>
        <div className="table-responsive">
          <table className="table mb-0 table-hover text-nowrap">
            <thead className="table-light">
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Du</th>
                <th>Au</th>
                <th>Jours</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {approuvedConges.filter(c => {
                const from = isoToDate(c.du)
                const to = isoToDate(c.au)
                const start = new Date(year, month, 1)
                const end = new Date(year, month + 1, 0)
                return from <= end && to >= start
              }).length === 0 ? (
                <tr><td colSpan="6" className="text-center py-3 text-muted">Aucune absence ce mois.</td></tr>
              ) : approuvedConges
                .filter(c => {
                  const from = isoToDate(c.du)
                  const to = isoToDate(c.au)
                  const start = new Date(year, month, 1)
                  const end = new Date(year, month + 1, 0)
                  return from <= end && to >= start
                })
                .map(c => (
                  <tr key={c.id} className="align-middle">
                    <td className="fw-medium">{c.employeNom}</td>
                    <td>
                      <span className={`badge bg-${TYPE_COLOR[c.type] ?? 'secondary'}-subtle text-${TYPE_COLOR[c.type] ?? 'secondary'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td>{c.du}</td>
                    <td>{c.au}</td>
                    <td>{c.jours}j</td>
                    <td>
                      <span className={`badge ${c.statut === 'Approuvé' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {c.statut}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  )
}
