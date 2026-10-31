package com.smartagri.apicommunication.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

/**
 * Room Database Offline Entity & DAO
 * Ensures 100% offline persistence for all pre-harvest, soil, and produce audits.
 */

@Entity(tableName = "inspections")
data class InspectionEntity(
    @PrimaryKey val id: String,
    val timestamp: Long,
    val domain: String,
    val cropOrItemName: String,
    val primaryResultTitle: String,
    val statusBadgeVariant: String,
    val statusBadgeLabel: String,
    val syncState: String, // "LOCAL_ONLY", "PENDING_SYNC", "SYNCED"
    val plotLocation: String,
    val diagnosisJson: String?,
    val thumbnailUri: String? = null
)

@Dao
interface InspectionDao {
    @Query("SELECT * FROM inspections ORDER BY timestamp DESC")
    fun getAllInspections(): Flow<List<InspectionEntity>>

    @Query("SELECT * FROM inspections WHERE syncState = 'PENDING_SYNC'")
    suspend fun getPendingSync(): List<InspectionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInspection(inspection: InspectionEntity)

    @Query("UPDATE inspections SET syncState = 'SYNCED' WHERE id IN (:ids)")
    suspend fun markAsSynced(ids: List<String>)

    @Query("DELETE FROM inspections WHERE id = :id")
    suspend fun deleteInspection(id: String)
}

@Database(entities = [InspectionEntity::class], version = 1, exportSchema = false)
abstract class AgriInspectionDatabase : RoomDatabase() {
    abstract fun inspectionDao(): InspectionDao
}
