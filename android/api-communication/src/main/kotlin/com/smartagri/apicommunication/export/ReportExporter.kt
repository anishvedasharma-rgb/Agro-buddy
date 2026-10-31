package com.smartagri.apicommunication.export

import android.content.Context
import android.os.Environment
import com.smartagri.apicommunication.db.InspectionEntity
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.*

/**
 * Field Report Exporter in Kotlin
 * Generates offline CSV ledgers for agricultural co-operatives and export shipments.
 */
object ReportExporter {

    fun exportToCSV(context: Context, inspections: List<InspectionEntity>): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val fileName = "AgriAudit_$timeStamp.csv"

        val exportDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            ?: context.filesDir
        val csvFile = File(exportDir, fileName)

        FileWriter(csvFile).use { writer ->
            writer.append("ID,Timestamp,Domain,Crop_Item,Diagnosis,Status,SyncState,PlotLocation\n")
            inspections.forEach { item ->
                writer.append("\"${item.id}\",")
                writer.append("\"${item.timestamp}\",")
                writer.append("\"${item.domain}\",")
                writer.append("\"${item.cropOrItemName}\",")
                writer.append("\"${item.primaryResultTitle.replace("\"", "\"\"")}\",")
                writer.append("\"${item.statusBadgeLabel}\",")
                writer.append("\"${item.syncState}\",")
                writer.append("\"${item.plotLocation}\"\n")
            }
        }

        return csvFile
    }
}
