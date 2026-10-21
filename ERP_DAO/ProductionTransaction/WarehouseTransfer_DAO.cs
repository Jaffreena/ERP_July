using ERP_DTO;
using ERP_DTO.ProductionTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;

namespace ERP_DAO.ProductionTransaction
{
    public class WarehouseTransfer_DAO
    {
        DBConnect DB = new DBConnect();

        private static object DbV(object v) => v ?? DBNull.Value;

        #region masters / numbering lookup (WHT_SP)

        // Id 0 = numbering lookup for the date, Id 1 = masters (UoM, Warehouse)
        public DataSet WarehouseTransferDB(int Id, DateTime? Date)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("WHT_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, Id);
            db.AddInParameter(cmd, "@Date", DbType.Date, Date.HasValue ? (object)Date.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        // running journal number for the date: Prefix + number (zero padded if PrefilZero) + Suffix
        public string WarehouseTransferNextNumberDB(DateTime WHTDate)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("WHT_GetNextNumber_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, 101);
            db.AddInParameter(cmd, "@WHTDate", DbType.Date, WHTDate);
            db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
            db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
            db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);

            db.ExecuteNonQuery(cmd);   // throws when no Reset row covers the date

            int next = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
            string prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix")) ?? "";
            string suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix")) ?? "";
            int digits = db.GetParameterValue(cmd, "@NumberOfDigits") == DBNull.Value ? 0 : Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
            bool pad = db.GetParameterValue(cmd, "@PrefilZero") != DBNull.Value && Convert.ToBoolean(db.GetParameterValue(cmd, "@PrefilZero"));

            string number = pad && digits > 0 ? next.ToString().PadLeft(digits, '0') : next.ToString();
            return prefix + number + suffix;
        }

        #endregion

        #region batch popup + temp reservation

        public DataSet GetBatchDetailsDB(long itemNumber, long warehouse, int itemGridIndex, int creatorCode, bool otherWarehouses)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("WHT_GetBatch_SP");

            db.AddInParameter(cmd, "@Item_Number", DbType.Int64, itemNumber);
            db.AddInParameter(cmd, "@Warehouse", DbType.Int64, warehouse);
            db.AddInParameter(cmd, "@ItemGridIndex", DbType.Int64, itemGridIndex);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, creatorCode);
            db.AddInParameter(cmd, "@OtherWarehouses", DbType.Boolean, otherWarehouses);

            return db.ExecuteDataSet(cmd);
        }

        // Id 1 : save selected batch rows (one grid row's batches) to temp
        public void TempBatchSaveDB(List<WarehouseTransferTempBatch_DTO> list, int creatorCode)
        {
            if (list == null || list.Count == 0) return;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        foreach (var t in list)
                        {
                            using (SqlCommand cmd = new SqlCommand("WHT_TempBatch_SP", con, tr))
                            {
                                cmd.CommandType = CommandType.StoredProcedure;
                                cmd.Parameters.AddWithValue("@Id", 1);
                                cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);
                                cmd.Parameters.AddWithValue("@DBCH_Index", t.DBCH_Index);
                                cmd.Parameters.AddWithValue("@DBCH_DBCH_Number", t.DBCH_DBCH_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Item_Number", t.DBCH_Item_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Warehouse", t.DBCH_Warehouse_Number);
                                cmd.Parameters.AddWithValue("@DBCH_Date", t.DBCH_Date);
                                cmd.Parameters.AddWithValue("@DBCH_No", DbV(t.DBCH_No));
                                cmd.Parameters.AddWithValue("@DBCH_Qty", t.DBCH_Qty);
                                cmd.Parameters.AddWithValue("@DBCH_UnitPrice", t.DBCH_UnitPrice ?? 0m);
                                cmd.Parameters.AddWithValue("@DBCH_Value", t.DBCH_Value ?? 0m);
                                cmd.ExecuteNonQuery();
                            }
                        }
                        tr.Commit();
                    }
                    catch { tr.Rollback(); throw; }
                }
            }
        }

        // Id 2 : clear temp rows of given grid rows (this user)
        public void TempBatchClearRowsDB(List<int> gridIndexes, int creatorCode)
        {
            if (gridIndexes == null || gridIndexes.Count == 0) return;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        foreach (int idx in gridIndexes.Distinct())
                            TempSp(con, tr, 2, creatorCode, idx);
                        tr.Commit();
                    }
                    catch { tr.Rollback(); throw; }
                }
            }
        }

        // Id 3 : clear all temp rows of this user (page load / cancel)
        public void TempBatchClearUserDB(int creatorCode)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();
                TempSp(con, null, 3, creatorCode, 0);
            }
        }

        private void TempSp(SqlConnection con, SqlTransaction tr, int id, int creatorCode, int index)
        {
            using (SqlCommand cmd = new SqlCommand("WHT_TempBatch_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);
                cmd.Parameters.AddWithValue("@DBCH_Index", index);
                cmd.ExecuteNonQuery();
            }
        }

        #endregion

        #region SAVE (WHT_Save_SP : head + item + batch + OUT + IN, all inside the SP)

        public long WarehouseTransferCreateDB(WarehouseTransferCreate_DTO DTO, int creatorCode)
        {
            var h = DTO.Header;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlCommand cmd = new SqlCommand("WHT_Save_SP", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@WHTH_JournalNo", h.WHTH_JournalNo ?? "");
                    cmd.Parameters.AddWithValue("@WHTH_Date", h.WHTH_Date);
                    cmd.Parameters.AddWithValue("@WHTH_MS_Number", h.WHTH_MS_Number);
                    cmd.Parameters.AddWithValue("@CreatorCode", creatorCode);

                    SqlParameter p1 = cmd.Parameters.AddWithValue("@Items", CreateItemTable(DTO.Items));
                    p1.SqlDbType = SqlDbType.Structured;
                    p1.TypeName = "dbo.WHT_ItemType";

                    SqlParameter p2 = cmd.Parameters.AddWithValue("@Batches", CreateBatchTable(DTO.Batches, DTO.Items));
                    p2.SqlDbType = SqlDbType.Structured;
                    p2.TypeName = "dbo.WHT_BatchType";

                    SqlParameter po = new SqlParameter("@WHTH_Number", SqlDbType.BigInt) { Direction = ParameterDirection.Output };
                    cmd.Parameters.Add(po);

                    cmd.ExecuteNonQuery();

                    return Convert.ToInt64(po.Value);
                }
            }
        }

        // RowIndex = 1-based position of the item row (JS sends 0-based, +1 here)
        private DataTable CreateItemTable(List<WarehouseTransferItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("RowIndex", typeof(long));
            dt.Columns.Add("WHTI_Item_Number", typeof(long));
            dt.Columns.Add("WHTI_From_WH_Number", typeof(long));
            dt.Columns.Add("WHTI_UoM_Number", typeof(long));
            dt.Columns.Add("WHTI_Qty", typeof(decimal));
            dt.Columns.Add("WHTI_To_WH_Number", typeof(long));

            if (items == null) return dt;

            long rowIndex = 1;
            foreach (var i in items)
                dt.Rows.Add(rowIndex++, i.WHTI_Item_Number, i.WHTI_From_WH_Number, i.WHTI_UoM_Number, i.WHTI_Qty, i.WHTI_To_WH_Number);

            return dt;
        }

        // WHTI_BCH_WHTI_Number from JS = 0-based index of the item row
        private DataTable CreateBatchTable(List<WarehouseTransferBatch_DTO> batches, List<WarehouseTransferItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("WHTI_BCH_WHTI_Number", typeof(long));
            dt.Columns.Add("WHTI_BCH_FWH_Number", typeof(long));
            dt.Columns.Add("WHTI_BCH_BatchDate", typeof(DateTime));
            dt.Columns.Add("WHTI_BCH_BatchNo", typeof(string));
            dt.Columns.Add("WHTI_BCH_BatchQty", typeof(decimal));
            dt.Columns.Add("WHTI_BCH_BatchUnitPrice", typeof(decimal));
            dt.Columns.Add("WHTI_BCH_BatchValue", typeof(decimal));
            dt.Columns.Add("WHTI_BCH_TWH_Number", typeof(long));
            dt.Columns.Add("WHTI_BCH_RefBatch_Number", typeof(long));

            if (batches == null) return dt;

            foreach (var b in batches)
            {
                int idx = b.WHTI_BCH_WHTI_Number;
                if (items == null || idx < 0 || idx >= items.Count)
                    throw new InvalidOperationException("Batch is linked to an invalid item row.");

                DateTime bd = b.WHTI_BCH_BatchDate.Year < 1900 ? DateTime.Today : b.WHTI_BCH_BatchDate;

                dt.Rows.Add(idx + 1L, b.WHTI_BCH_FWH_Number, bd, b.WHTI_BCH_BatchNo,
                            b.WHTI_BCH_BatchQty, b.WHTI_BCH_BatchUnitPrice, b.WHTI_BCH_BatchValue,
                            b.WHTI_BCH_TWH_Number, b.WHTI_BCH_RefBatch_Number);
            }
            return dt;
        }

        #endregion

        #region numbering setup (WHT_Numbering_SP)

        // Id: 1 setup data, 11-14 inserts, 21-22, 31-33, 41-44, 51-53, 101-103
        public DataSet WarehouseTransferNumberingDB(int Id, WarehouseTransferNumbering_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("WHT_Numbering_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, Id);
            db.AddInParameter(cmd, "@WHTN_Number", DbType.Int64, dto.WHTN_Number);
            db.AddInParameter(cmd, "@WHTN_Method", DbType.Int64, dto.WHTN_Method);
            db.AddInParameter(cmd, "@WHTN_Date", DbType.Int32, dto.WHTN_Date);
            db.AddInParameter(cmd, "@WHTN_EndDate", DbType.Int32, dto.WHTN_EndDate);
            db.AddInParameter(cmd, "@WHTN_StartingNumber", DbType.Int32, dto.WHTN_StartingNumber);
            db.AddInParameter(cmd, "@WHTN_NumberofDigits", DbType.Int32, dto.WHTN_NumberofDigits);
            db.AddInParameter(cmd, "@WHTN_PrefilZero", DbType.Int64, dto.WHTN_PrefilZero);
            db.AddInParameter(cmd, "@WHTN_Frequency", DbType.Int64, dto.WHTN_Frequency);
            db.AddInParameter(cmd, "@WHTN_Particulars", DbType.String, dto.WHTN_Particulars);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, dto.DeleteNumbers);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, dto.CreatorCode);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region summary / detailed

        public DataSet WarehouseTransferSummaryDB()
        {
            Database db = new SqlDatabase(DB.Connection());
            return db.ExecuteDataSet(db.GetStoredProcCommand("WHT_Summary_SP"));
        }

        public DataSet WarehouseTransferDetailedDB()
        {
            Database db = new SqlDatabase(DB.Connection());
            return db.ExecuteDataSet(db.GetStoredProcCommand("WHT_Detailed_SP"));
        }

        #endregion
    }
}