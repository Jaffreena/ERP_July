using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobInwardTransaction
{

    public class ReceiptNote_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_ReceiptNoteDB(ReceiptNote_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JI_ReceiptNote_SP");

            // =======================
            // 🔹 HEADER (JIRNH)
            // =======================
            Db.AddInParameter(DbC, "@JIRNH_Number", DbType.Int64, DTO.JIRNH_Number);
            Db.AddInParameter(DbC, "@JIRNH_RN_No", DbType.String, DTO.JIRNH_RN_No);
            Db.AddInParameter(DbC, "@JIRNH_RN_Date", DbType.Date, DTO.JIRNH_RN_Date);
            Db.AddInParameter(DbC, "@JIRNH_JW_CustomerDC_No", DbType.String, DTO.JIRNH_JW_CustomerDC_No);
            Db.AddInParameter(DbC, "@JIRNH_JW_CustomerDC_Date", DbType.Date, DTO.JIRNH_JW_CustomerDC_Date);
            Db.AddInParameter(DbC, "@JIRNH_MS_Number", DbType.Int64, DTO.JIRNH_MS_Number);
            Db.AddInParameter(DbC, "@JIRNH_JWC_Number", DbType.Int64, DTO.JIRNH_JWC_Number);
            Db.AddInParameter(DbC, "@JIRNH_Currency_Number", DbType.Int64, DTO.JIRNH_Currency_Number);
            Db.AddInParameter(DbC, "@JIRNH_WH_Number", DbType.Int64, DTO.JIRNH_WH_Number);
            Db.AddInParameter(DbC, "@JIRNH_Remarks", DbType.String, DTO.JIRNH_Remarks);

            // =======================
            // 🔹 ITEM (JIRNI)
            // =======================
            Db.AddInParameter(DbC, "@JIRNI_Number", DbType.Int64, DTO.JIRNI_Number);
            Db.AddInParameter(DbC, "@JIRNI_PRS_Number", DbType.Int64, DTO.JIRNI_PRS_Number);
            Db.AddInParameter(DbC, "@JIRNI_PRS_Name", DbType.String, DTO.JIRNI_PRS_Name);
            Db.AddInParameter(DbC, "@JIRNI_Item_Number", DbType.Int64, DTO.JIRNI_Item_Number);
            Db.AddInParameter(DbC, "@JIRNI_WH_Number", DbType.Int64, DTO.JIRNI_WH_Number);
            Db.AddInParameter(DbC, "@JIRNI_ITM_Code", DbType.String, DTO.JIRNI_ITM_Code);
            Db.AddInParameter(DbC, "@JIRNI_UoM_Number", DbType.Int64, DTO.JIRNI_UoM_Number);
            Db.AddInParameter(DbC, "@JIRNI_Qty", DbType.Decimal, DTO.JIRNI_Qty);
            Db.AddInParameter(DbC, "@JIRNI_UnitPrice", DbType.Decimal, DTO.JIRNI_UnitPrice);
            Db.AddInParameter(DbC, "@JIRNI_Amount", DbType.Decimal, DTO.JIRNI_Amount);

            // =======================
            // 🔹 BATCH (JIRNI_BCH)
            // =======================
            Db.AddInParameter(DbC, "@JIRNI_BCH_Number", DbType.Int64, DTO.JIRNI_BCH_Number);
            Db.AddInParameter(DbC, "@JIRNI_BCH_WH_Number", DbType.Int64, DTO.JIRNI_BCH_WH_Number);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchDate", DbType.Date, DTO.JIRNI_BCH_BatchDate);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchNo", DbType.String, DTO.JIRNI_BCH_BatchNo);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchQty", DbType.Decimal, DTO.JIRNI_BCH_BatchQty);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchUnitPrice", DbType.Decimal, DTO.JIRNI_BCH_BatchUnitPrice);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchValue", DbType.Decimal, DTO.JIRNI_BCH_BatchValue);

            // =======================
            // 🔹 COMMON (IMPORTANT ❗)
            // =======================
            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, DTO.JIRN_DeleteNumbers);
            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int64, DTO.JIRN_CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, DTO.JIRN_Id);

            //---numbering
            Db.AddInParameter(DbC, "@RNH_Date", DbType.Int64, DTO.RNH_Date);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }


        public DataSet JI_ReceiptNoteEditDB(ReceiptNoteEdit_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JI_ReceiptNote_SP");

            // =======================
            // 🔹 HEADER (JIRNH)
            // =======================
            Db.AddInParameter(DbC, "@JIRNH_Number", DbType.Int64, DTO.JIRNH_Number);
            Db.AddInParameter(DbC, "@JIRNH_RN_No", DbType.String, DTO.JIRNH_RN_No);
            Db.AddInParameter(DbC, "@JIRNH_RN_Date", DbType.Date, DTO.JIRNH_RN_Date);
            Db.AddInParameter(DbC, "@JIRNH_JW_CustomerDC_No", DbType.String, DTO.JIRNH_JW_CustomerDC_No);
            Db.AddInParameter(DbC, "@JIRNH_JW_CustomerDC_Date", DbType.Date, DTO.JIRNH_JW_CustomerDC_Date);
            Db.AddInParameter(DbC, "@JIRNH_MS_Number", DbType.Int64, DTO.JIRNH_MS_Number);
            Db.AddInParameter(DbC, "@JIRNH_JWC_Number", DbType.Int64, DTO.JIRNH_JWC_Number);
            Db.AddInParameter(DbC, "@JIRNH_Currency_Number", DbType.Int64, DTO.JIRNH_Currency_Number);
            Db.AddInParameter(DbC, "@JIRNH_WH_Number", DbType.Int64, DTO.JIRNH_WH_Number);
            Db.AddInParameter(DbC, "@JIRNH_Remarks", DbType.String, DTO.JIRNH_Remarks);

            // =======================
            // 🔹 ITEM (JIRNI)
            // =======================
            Db.AddInParameter(DbC, "@JIRNI_Number", DbType.Int64, DTO.JIRNI_Number);
            Db.AddInParameter(DbC, "@JIRNI_PRS_Number", DbType.Int64, DTO.JIRNI_PRS_Number);
            Db.AddInParameter(DbC, "@JIRNI_PRS_Name", DbType.String, DTO.JIRNI_PRS_Name);
            Db.AddInParameter(DbC, "@JIRNI_Item_Number", DbType.Int64, DTO.JIRNI_Item_Number);
            Db.AddInParameter(DbC, "@JIRNI_WH_Number", DbType.Int64, DTO.JIRNI_WH_Number);
            Db.AddInParameter(DbC, "@JIRNI_ITM_Code", DbType.String, DTO.JIRNI_ITM_Code);
            Db.AddInParameter(DbC, "@JIRNI_UoM_Number", DbType.Int64, DTO.JIRNI_UoM_Number);
            Db.AddInParameter(DbC, "@JIRNI_Qty", DbType.Decimal, DTO.JIRNI_OriginalQty);           
            Db.AddInParameter(DbC, "@JIRNI_AmendedQty", DbType.Decimal, DTO.JIRNI_AmendedQty);
            Db.AddInParameter(DbC, "@JIRNI_UnitPrice", DbType.Decimal, DTO.JIRNI_UnitPrice);
            Db.AddInParameter(DbC, "@JIRNI_Amount", DbType.Decimal, DTO.JIRNI_Amount);

            // =======================
            // 🔹 BATCH (JIRNI_BCH)
            // =======================
            Db.AddInParameter(DbC, "@JIRNI_BCH_Number", DbType.Int64, DTO.JIRNI_BCH_Number);
            Db.AddInParameter(DbC, "@JIRNI_BCH_WH_Number", DbType.Int64, DTO.JIRNI_BCH_WH_Number);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchDate", DbType.Date, DTO.JIRNI_BCH_BatchDate);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchNo", DbType.String, DTO.JIRNI_BCH_BatchNo);
          
            Db.AddInParameter(DbC, "@JIRNI_BCH_AmendedQty", DbType.Decimal, DTO.JIRNI_BCH_BatchAmendedQty);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchUnitPrice", DbType.Decimal, DTO.JIRNI_BCH_BatchUnitPrice);
            Db.AddInParameter(DbC, "@JIRNI_BCH_BatchValue", DbType.Decimal, DTO.JIRNI_BCH_BatchValue);

            // =======================
            // 🔹 COMMON (IMPORTANT ❗)
            // =======================
            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, DTO.JIRN_DeleteNumbers);
            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int64, DTO.JIRN_CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, DTO.JIRN_Id);

            //---numbering
            Db.AddInParameter(DbC, "@RNH_Date", DbType.Int64, DTO.RNH_Date);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }


        public DataSet ReceiptNoteJSONDB(long JIRNH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("SP_JI_ReceiptNote_GetByNumber_JSON");

            db.AddInParameter(cmd, "@JIRNH_Number", DbType.Int64, JIRNH_Number);

            return db.ExecuteDataSet(cmd);
        }
        public DataSet ReceiptNoteBatchDB(long JIRNI_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("SP_JI_ReceiptNoteBatch_GetByReceiptNoteItem");

            db.AddInParameter(cmd, "@JIRNI_Number", DbType.Int64, JIRNI_Number);

            return db.ExecuteDataSet(cmd);
        }
        public void ReceiptNoteBulkUpdate(
      ReceiptNoteCreate_DTO RN_DTO,
      SqlConnection con,
      SqlTransaction tr)
        {
            //==========================
            // Item DataTable
            //==========================
            DataTable dtItems = new DataTable();

            dtItems.Columns.Add("Item_Index", typeof(long));
            dtItems.Columns.Add("JIRNI_Number", typeof(long));
            dtItems.Columns.Add("JIRNI_PRS_Number", typeof(long));
            dtItems.Columns.Add("JIRNI_Item_Number", typeof(long));
            dtItems.Columns.Add("JIRNI_WH_Number", typeof(long));
            dtItems.Columns.Add("JIRNI_UoM_Number", typeof(long));
            dtItems.Columns.Add("JIRNI_Qty", typeof(decimal));
            dtItems.Columns.Add("JIRNI_UnitPrice", typeof(decimal));
            dtItems.Columns.Add("JIRNI_Amount", typeof(decimal));

            foreach (var item in RN_DTO.Items)
            {
                dtItems.Rows.Add(
                    item.Item_Index,
                    item.JIRNI_Number,
                    item.PRS_Number,
                    item.Item_Number,
                    item.WH_Number,
                    item.UoM_Number,
                    item.Qty,
                    item.UnitPrice,
                    item.Amount
                );
            }

            //==========================
            // Batch DataTable
            //==========================
            DataTable dtBatches = new DataTable();

            dtBatches.Columns.Add("Item_Index", typeof(long));
            dtBatches.Columns.Add("JIRNI_BCH_Number", typeof(long));
            dtBatches.Columns.Add("JIRNI_BCH_JIRNI_Number", typeof(long));
            dtBatches.Columns.Add("JIRNI_BCH_WH_Number", typeof(long));
            dtBatches.Columns.Add("JIRNI_BCH_BatchDate", typeof(DateTime));
            dtBatches.Columns.Add("JIRNI_BCH_BatchNo", typeof(string));
            dtBatches.Columns.Add("JIRNI_BCH_BatchQty", typeof(decimal));
            dtBatches.Columns.Add("JIRNI_BCH_BatchUnitPrice", typeof(decimal));
            dtBatches.Columns.Add("JIRNI_BCH_BatchValue", typeof(decimal));

            foreach (var batch in RN_DTO.ItemBatch)
            {
                dtBatches.Rows.Add(
                    batch.RNI_BCH_Item_Index,
                    batch.RNI_BCH_No,
                    batch.JIRNI_Number,
                    batch.RNI_BCH_WH_Number,
                    batch.RNI_BCH_Date,
                    batch.RNI_BCH_Number,
                    batch.RNI_BCH_Qty,
                    batch.RNI_BCH_UnitPrice,
                    batch.RNI_BCH_Value
                );
            }

            //==========================
            // Call Single Stored Procedure
            //==========================
            using (SqlCommand cmd = new SqlCommand("SP_JI_ReceiptNote_Update", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@JIRNH_Number", RN_DTO.Header.JIRNH_Number);

                SqlParameter itemParam = cmd.Parameters.AddWithValue("@Items", dtItems);
                itemParam.SqlDbType = SqlDbType.Structured;
                itemParam.TypeName = "ReceiptNoteItemType";

                SqlParameter batchParam = cmd.Parameters.AddWithValue("@Batches", dtBatches);
                batchParam.SqlDbType = SqlDbType.Structured;
                batchParam.TypeName = "ReceiptNoteBatchType";

                cmd.ExecuteNonQuery();
            }
        }

        public void ReceiptNoteHeaderUpdate(
        ReceiptNoteCreate_DTO RN_DTO,
        SqlConnection con,
        SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand("SP_JI_ReceiptNoteHead_Update", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@JIRNH_Number", RN_DTO.Header.JIRNH_Number);
                cmd.Parameters.AddWithValue("@JIRNH_RN_No", RN_DTO.Header.RN_No);
                cmd.Parameters.AddWithValue("@JIRNH_RN_Date", RN_DTO.Header.RN_Date);

                cmd.Parameters.AddWithValue("@JIRNH_JW_CustomerDC_No",
                    RN_DTO.Header.JW_CustomerDC_No ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue("@JIRNH_JW_CustomerDC_Date",
                    RN_DTO.Header.JW_CustomerDC_Date);

                cmd.Parameters.AddWithValue("@JIRNH_MS_Number", RN_DTO.Header.MS_Number);
                cmd.Parameters.AddWithValue("@JIRNH_JWC_Number", RN_DTO.Header.JWC_Number);
                cmd.Parameters.AddWithValue("@JIRNH_Currency_Number", RN_DTO.Header.Currency_Number);
                cmd.Parameters.AddWithValue("@JIRNH_WH_Number", RN_DTO.Header.WH_Number);

                cmd.Parameters.AddWithValue("@JIRNH_Remarks",
                    RN_DTO.Header.Remarks ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue("@UserCode", 0);

                cmd.ExecuteNonQuery();
            }
        }

        public void ReceiptNoteUpdateDB(ReceiptNoteCreate_DTO RN_DTO)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        ReceiptNoteHeaderUpdate(RN_DTO, con, tr);

                        ReceiptNoteBulkUpdate(RN_DTO, con, tr);

                        tr.Commit();
                    }
                    catch (Exception)
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }

    }
}
