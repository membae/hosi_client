import { useEffect, useState } from "react"

function Reports() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)

  // CREATE FORM STATE
  const [patientId, setPatientId] = useState("")
  const [userId, setUserId] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [images, setImages] = useState([])

  // UPDATE STATE
  const [updateImages, setUpdateImages] = useState([])
  const [replaceImages, setReplaceImages] = useState(false)

  // FETCH REPORTS
  useEffect(() => {
    fetch("http://127.0.0.1:5000/reports")
      .then(res => res.json())
      .then(setReports)
      .catch(err => console.error("Failed to fetch reports:", err))
  }, [])

  // CREATE REPORT
  function handleCreate(e) {
    e.preventDefault()

    const formData = new FormData()
    formData.append("patient_id", patientId)
    formData.append("user_id", userId)
    formData.append("diagnosis", diagnosis)

    images.forEach(img => formData.append("images", img))

    fetch("http://127.0.0.1:5000/reports", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(newReport => {
        setReports(prev => [...prev, newReport])
        setPatientId("")
        setUserId("")
        setDiagnosis("")
        setImages([])
      })
      .catch(err => console.error("Create failed:", err))
  }

  // SELECT REPORT
  function selectReport(report) {
    setSelectedReport(report)
    setDiagnosis(report.diagnosis)
    setUpdateImages([])
    setReplaceImages(false)
  }

  // UPDATE REPORT
  function handleUpdate() {
    if (!selectedReport) return

    const formData = new FormData()
    formData.append("diagnosis", diagnosis)
    formData.append("replace_images", replaceImages)

    updateImages.forEach(img => formData.append("images", img))

    fetch(`http://127.0.0.1:5000/reports/${selectedReport.id}`, {
      method: "PATCH",
      body: formData
    })
      .then(res => res.json())
      .then(updated => {
        setReports(prev =>
          prev.map(r => (r.id === updated.id ? updated : r))
        )
        setSelectedReport(updated)
      })
      .catch(err => console.error("Update failed:", err))
  }

  // DELETE REPORT
  function handleDelete(id) {
    fetch(`http://127.0.0.1:5000/reports/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setReports(prev => prev.filter(r => r.id !== id))
        setSelectedReport(null)
      })
      .catch(err => console.error("Delete failed:", err))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CREATE */}
        <form
          onSubmit={handleCreate}
          className="bg-white p-5 rounded-xl shadow space-y-4"
        >
          <h2 className="text-xl font-semibold">Create Report</h2>

          <input
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patient ID"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            required
          />

          <input
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />

          <textarea
            className="w-full border rounded-lg p-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Diagnosis"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            required
          />

          <input
            type="file"
            multiple
            className="w-full text-sm"
            onChange={e => setImages([...e.target.files])}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Create Report
          </button>
        </form>

        {/* LIST */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>

          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report.id}
                onClick={() => selectReport(report)}
                className={`p-3 border rounded-lg cursor-pointer transition
                  ${
                    selectedReport?.id === report.id
                      ? "bg-blue-50 border-blue-400"
                      : "hover:bg-gray-100"
                  }`}
              >
                <p className="font-semibold">Report #{report.id}</p>
                <p className="text-sm text-gray-600 truncate">
                  {report.diagnosis}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        {selectedReport && (
          <div className="bg-white p-5 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">
              Report #{selectedReport.id}
            </h2>

            <textarea
              className="w-full border rounded-lg p-2 h-28 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
            />

            <div>
              <h3 className="font-medium mb-2">Images</h3>
              <div className="flex flex-wrap gap-3">
                {selectedReport.images?.map(img => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt="report"
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                  />
                ))}
              </div>
            </div>

            <input
              type="file"
              multiple
              className="w-full text-sm"
              onChange={e => setUpdateImages([...e.target.files])}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={replaceImages}
                onChange={e => setReplaceImages(e.target.checked)}
              />
              Replace existing images
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                Update
              </button>

              <button
                onClick={() => handleDelete(selectedReport.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Reports
