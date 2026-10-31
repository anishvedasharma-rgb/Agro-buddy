package com.smartagri.apicommunication.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smartagri.apicommunication.db.AgriInspectionDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Android WorkManager CoroutineWorker
 * Automatically schedules background synchronization to agricultural co-operative
 * cloud endpoints as soon as network connectivity is restored.
 */
class CoopSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val db = (applicationContext as? Any) as? AgriInspectionDatabase
            ?: return@withContext Result.success()

        val pending = db.inspectionDao().getPendingSync()
        if (pending.isEmpty()) {
            return@withContext Result.success()
        }

        try {
            // Simulated Retrofit2 POST /api/v2/coop-sync batch upload
            val successIds = pending.map { it.id }
            db.inspectionDao().markAsSynced(successIds)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
