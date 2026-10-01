using ERP_DTO.JobOutwardTransaction;
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

namespace ERP_DAO.JobOutwardTransaction
{
    public class JO_ServiceOrder_DAO
    {
        DBConnect DB = new DBConnect();

        #region lookup (dropdowns / vendor search / item search)
        // SVO_Id : 1 = dropdowns, 5 = JW Vendor search, 6 = Item search
        public DataSet JO_ServiceOrderLookupDB(int SVO_Id, string JW_Vendor, string Item_Code, long? MS_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_ServiceOrder_SP");

            db.AddInParameter(cmd, "@SVO_Id", DbType.Int32, SVO_Id);
            db.AddInParameter(cmd, "@JW_Vendor", DbType.String, JW_Vendor);
            db.AddInParameter(cmd, "@Item_Code", DbType.String, Item_Code);
            db.AddInParameter(cmd, "@MS_Number", DbType.Int64, MS_Number);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region insert
        public long JOJWI_ServiceOrderInsertDB(JOJWI_ServiceOrder_DTO dto)
        {
            long headNumber = 0;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        headNumber = JOJWI_ServiceOrderHeadInsert(dto.Header, con, tr);
                        JOJWI_ServiceOrderItemBulkInsert(headNumber, dto.Items, con, tr);

                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }

            return headNumber;
        }

        public long JOFRT_ServiceOrderInsertDB(JOFRT_ServiceOrder_DTO dto)
        {
            long headNumber = 0;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        headNumber = JOFRT_ServiceOrderHeadInsert(dto.Header, con, tr);
                        JOFRT_ServiceOrderItemBulkInsert(headNumber, dto.Items, con, tr);

                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }

            return headNumber;
        }

        private long JOJWI_ServiceOrderHeadInsert(JOJWI_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JOJWI_ServiceOrderHead_Insert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOJWI_SVOH_ServiceOrderNo", h.JOJWI_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_ServiceOrderDate", h.JOJWI_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_MS_Number", h.JOJWI_SVOH_MS_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_JW_Vendor_Number", h.JOJWI_SVOH_JW_Vendor_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Currency_Number", h.JOJWI_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_PaymentTerms", h.JOJWI_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_DeliveryTerms", h.JOJWI_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_DeliveryMode", h.JOJWI_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Tax", h.JOJWI_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_TDC", h.JOJWI_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Remarks", h.JOJWI_SVOH_Remarks ?? "");

            SqlParameter outParam = new SqlParameter("@NewNumber", SqlDbType.BigInt) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(outParam);

            cmd.ExecuteNonQuery();
            return Convert.ToInt64(outParam.Value);
        }

        private long JOFRT_ServiceOrderHeadInsert(JOFRT_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JOFRT_ServiceOrderHead_Insert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOFRT_SVOH_ServiceOrderNo", h.JOFRT_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_ServiceOrderDate", h.JOFRT_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Category", h.JOFRT_SVOH_Category ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_JW_Vendor_Number", h.JOFRT_SVOH_JW_Vendor_Number);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Currency_Number", h.JOFRT_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_PaymentTerms", h.JOFRT_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_DeliveryTerms", h.JOFRT_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_DeliveryMode", h.JOFRT_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Tax", h.JOFRT_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_TDC", h.JOFRT_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Remarks", h.JOFRT_SVOH_Remarks ?? "");

            SqlParameter outParam = new SqlParameter("@NewNumber", SqlDbType.BigInt) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(outParam);

            cmd.ExecuteNonQuery();
            return Convert.ToInt64(outParam.Value);
        }

        private DataTable CreateJOJWIServiceOrderItemTable(List<JOJWI_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JOJWI_SVOI_JPRS_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_Item_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_WH_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_Qty", typeof(double));
            dt.Columns.Add("JOJWI_SVOI_UnitPrice", typeof(double));
            dt.Columns.Add("JOJWI_SVOI_Amount", typeof(double));
            dt.Columns.Add("JOJWI_SVOI_DeliveryDate", typeof(DateTime));

            foreach (var item in items)
            {
                if (item.JOJWI_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JOJWI_SVOI_JPRS_Number"] = item.JOJWI_SVOI_JPRS_Number;
                row["JOJWI_SVOI_Item_Number"] = item.JOJWI_SVOI_Item_Number;
                row["JOJWI_SVOI_WH_Number"] = item.JOJWI_SVOI_WH_Number.HasValue ? item.JOJWI_SVOI_WH_Number.Value : DBNull.Value;
                row["JOJWI_SVOI_UoM_Number"] = item.JOJWI_SVOI_UoM_Number;
                row["JOJWI_SVOI_Qty"] = item.JOJWI_SVOI_Qty;
                row["JOJWI_SVOI_UnitPrice"] = item.JOJWI_SVOI_UnitPrice;
                row["JOJWI_SVOI_Amount"] = item.JOJWI_SVOI_Amount;
                row["JOJWI_SVOI_DeliveryDate"] = item.JOJWI_SVOI_DeliveryDate.HasValue ? item.JOJWI_SVOI_DeliveryDate.Value : DBNull.Value;

                dt.Rows.Add(row);
            }

            return dt;
        }

        private DataTable CreateJOFRTServiceOrderItemTable(List<JOFRT_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JOFRT_SVOI_JPRS_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_FromWH_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_ToWH_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_Qty", typeof(double));
            dt.Columns.Add("JOFRT_SVOI_Rate", typeof(double));
            dt.Columns.Add("JOFRT_SVOI_Amount", typeof(double));

            foreach (var item in items)
            {
                if (item.JOFRT_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JOFRT_SVOI_JPRS_Number"] = item.JOFRT_SVOI_JPRS_Number;
                row["JOFRT_SVOI_FromWH_Number"] = item.JOFRT_SVOI_FromWH_Number.HasValue ? item.JOFRT_SVOI_FromWH_Number.Value : DBNull.Value;
                row["JOFRT_SVOI_ToWH_Number"] = item.JOFRT_SVOI_ToWH_Number.HasValue ? item.JOFRT_SVOI_ToWH_Number.Value : DBNull.Value;
                row["JOFRT_SVOI_UoM_Number"] = item.JOFRT_SVOI_UoM_Number;
                row["JOFRT_SVOI_Qty"] = item.JOFRT_SVOI_Qty;
                row["JOFRT_SVOI_Rate"] = item.JOFRT_SVOI_Rate;
                row["JOFRT_SVOI_Amount"] = item.JOFRT_SVOI_Amount;

                dt.Rows.Add(row);
            }

            return dt;
        }

        private void JOJWI_ServiceOrderItemBulkInsert(long headerNumber, List<JOJWI_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJOJWIServiceOrderItemTable(items);

            using SqlCommand cmd = new SqlCommand("JOJWI_ServiceOrderItem_BulkInsert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JOJWI_ServiceOrderItemType";

            cmd.ExecuteNonQuery();
        }

        private void JOFRT_ServiceOrderItemBulkInsert(long headerNumber, List<JOFRT_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJOFRTServiceOrderItemTable(items);

            using SqlCommand cmd = new SqlCommand("JOFRT_ServiceOrderItem_BulkInsert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JOFRT_ServiceOrderItemType";

            cmd.ExecuteNonQuery();
        }
        #endregion

        #region update
        public void JOJWI_ServiceOrderUpdateDB(JOJWI_ServiceOrder_DTO dto)
        {
            using SqlConnection con = new SqlConnection(DB.Connection());
            con.Open();

            using SqlTransaction tr = con.BeginTransaction();
            try
            {
                JOJWI_ServiceOrderHeadUpdate(dto.Header, con, tr);
                JOJWI_ServiceOrderItemUpdate(dto.Header.JOJWI_SVOH_Number, dto.Items, con, tr);

                tr.Commit();
            }
            catch
            {
                tr.Rollback();
                throw;
            }
        }

        public void JOFRT_ServiceOrderUpdateDB(JOFRT_ServiceOrder_DTO dto)
        {
            using SqlConnection con = new SqlConnection(DB.Connection());
            con.Open();

            using SqlTransaction tr = con.BeginTransaction();
            try
            {
                JOFRT_ServiceOrderHeadUpdate(dto.Header, con, tr);
                JOFRT_ServiceOrderItemUpdate(dto.Header.JOFRT_SVOH_Number, dto.Items, con, tr);

                tr.Commit();
            }
            catch
            {
                tr.Rollback();
                throw;
            }
        }

        private void JOJWI_ServiceOrderHeadUpdate(JOJWI_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JOJWI_ServiceOrderHead_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Number", h.JOJWI_SVOH_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_ServiceOrderNo", h.JOJWI_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_ServiceOrderDate", h.JOJWI_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_MS_Number", h.JOJWI_SVOH_MS_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_JW_Vendor_Number", h.JOJWI_SVOH_JW_Vendor_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Currency_Number", h.JOJWI_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_PaymentTerms", h.JOJWI_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_DeliveryTerms", h.JOJWI_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_DeliveryMode", h.JOJWI_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Tax", h.JOJWI_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_TDC", h.JOJWI_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Remarks", h.JOJWI_SVOH_Remarks ?? "");

            cmd.ExecuteNonQuery();
        }

        private void JOFRT_ServiceOrderHeadUpdate(JOFRT_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JOFRT_ServiceOrderHead_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Number", h.JOFRT_SVOH_Number);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_ServiceOrderNo", h.JOFRT_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_ServiceOrderDate", h.JOFRT_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Category", h.JOFRT_SVOH_Category ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_JW_Vendor_Number", h.JOFRT_SVOH_JW_Vendor_Number);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Currency_Number", h.JOFRT_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_PaymentTerms", h.JOFRT_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_DeliveryTerms", h.JOFRT_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_DeliveryMode", h.JOFRT_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Tax", h.JOFRT_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_TDC", h.JOFRT_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Remarks", h.JOFRT_SVOH_Remarks ?? "");

            cmd.ExecuteNonQuery();
        }

        private DataTable CreateJOJWIServiceOrderItemUpdateTable(List<JOJWI_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JOJWI_SVOI_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_JPRS_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_Item_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_WH_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JOJWI_SVOI_Qty", typeof(double));
            dt.Columns.Add("JOJWI_SVOI_UnitPrice", typeof(double));
            dt.Columns.Add("JOJWI_SVOI_Amount", typeof(double));
            dt.Columns.Add("JOJWI_SVOI_DeliveryDate", typeof(DateTime));

            foreach (var item in items)
            {
                if (item.JOJWI_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JOJWI_SVOI_Number"] = item.JOJWI_SVOI_Number > 0 ? item.JOJWI_SVOI_Number : (object)DBNull.Value;
                row["JOJWI_SVOI_JPRS_Number"] = item.JOJWI_SVOI_JPRS_Number;
                row["JOJWI_SVOI_Item_Number"] = item.JOJWI_SVOI_Item_Number;
                row["JOJWI_SVOI_WH_Number"] = item.JOJWI_SVOI_WH_Number.HasValue ? item.JOJWI_SVOI_WH_Number.Value : DBNull.Value;
                row["JOJWI_SVOI_UoM_Number"] = item.JOJWI_SVOI_UoM_Number;
                row["JOJWI_SVOI_Qty"] = item.JOJWI_SVOI_Qty;
                row["JOJWI_SVOI_UnitPrice"] = item.JOJWI_SVOI_UnitPrice;
                row["JOJWI_SVOI_Amount"] = item.JOJWI_SVOI_Amount;
                row["JOJWI_SVOI_DeliveryDate"] = item.JOJWI_SVOI_DeliveryDate.HasValue ? item.JOJWI_SVOI_DeliveryDate.Value : DBNull.Value;

                dt.Rows.Add(row);
            }

            return dt;
        }

        private DataTable CreateJOFRTServiceOrderItemUpdateTable(List<JOFRT_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JOFRT_SVOI_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_JPRS_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_FromWH_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_ToWH_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JOFRT_SVOI_Qty", typeof(double));
            dt.Columns.Add("JOFRT_SVOI_Rate", typeof(double));
            dt.Columns.Add("JOFRT_SVOI_Amount", typeof(double));

            foreach (var item in items)
            {
                if (item.JOFRT_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JOFRT_SVOI_Number"] = item.JOFRT_SVOI_Number > 0 ? item.JOFRT_SVOI_Number : (object)DBNull.Value;
                row["JOFRT_SVOI_JPRS_Number"] = item.JOFRT_SVOI_JPRS_Number;
                row["JOFRT_SVOI_FromWH_Number"] = item.JOFRT_SVOI_FromWH_Number.HasValue ? item.JOFRT_SVOI_FromWH_Number.Value : DBNull.Value;
                row["JOFRT_SVOI_ToWH_Number"] = item.JOFRT_SVOI_ToWH_Number.HasValue ? item.JOFRT_SVOI_ToWH_Number.Value : DBNull.Value;
                row["JOFRT_SVOI_UoM_Number"] = item.JOFRT_SVOI_UoM_Number;
                row["JOFRT_SVOI_Qty"] = item.JOFRT_SVOI_Qty;
                row["JOFRT_SVOI_Rate"] = item.JOFRT_SVOI_Rate;
                row["JOFRT_SVOI_Amount"] = item.JOFRT_SVOI_Amount;

                dt.Rows.Add(row);
            }

            return dt;
        }

        private void JOJWI_ServiceOrderItemUpdate(long headerNumber, List<JOJWI_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJOJWIServiceOrderItemUpdateTable(items);

            using SqlCommand cmd = new SqlCommand("JOJWI_ServiceOrderItem_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOJWI_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JOJWI_ServiceOrderItem_Update_TableType";

            cmd.ExecuteNonQuery();
        }

        private void JOFRT_ServiceOrderItemUpdate(long headerNumber, List<JOFRT_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJOFRTServiceOrderItemUpdateTable(items);

            using SqlCommand cmd = new SqlCommand("JOFRT_ServiceOrderItem_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JOFRT_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JOFRT_ServiceOrderItem_Update_TableType";

            cmd.ExecuteNonQuery();
        }
        #endregion

        #region register
        public DataSet JOJWI_ServiceOrderSummaryDB(JOJWI_ServiceOrderSummary_DTO SO_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JOJWI_ServiceOrder_Summary_SP");

            db.AddInParameter(cmd, "@SO_Id", DbType.Int32, SO_DTO.SO_Id);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet JOFRT_ServiceOrderSummaryDB(JOFRT_ServiceOrderSummary_DTO SO_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JOFRT_ServiceOrder_Summary_SP");

            db.AddInParameter(cmd, "@SO_Id", DbType.Int32, SO_DTO.SO_Id);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region numbering

        // ---------- JOJWI setup ----------
        public DataSet JOJWI_SVO_NumberingDB(JOJWI_SVO_Numbering_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOJWI_SVO_Numbering_SP");

            db.AddInParameter(cmd, "@JOJWI_SVO_Number", DbType.Int64, dto.JOJWI_SVO_Number);
            db.AddInParameter(cmd, "@JOJWI_SVO_Method", DbType.String, dto.JOJWI_SVO_Method);
            db.AddInParameter(cmd, "@JOJWI_SVO_Date", DbType.String, dto.JOJWI_SVO_Date);
            db.AddInParameter(cmd, "@JOJWI_SVO_EndDate", DbType.String, dto.JOJWI_SVO_EndDate);
            db.AddInParameter(cmd, "@JOJWI_SVO_StartingNumber", DbType.String, dto.JOJWI_SVO_StartingNumber);
            db.AddInParameter(cmd, "@JOJWI_SVO_NumberofDigits", DbType.String, dto.JOJWI_SVO_NumberofDigits);
            db.AddInParameter(cmd, "@JOJWI_SVO_PrefilZero", DbType.String, dto.JOJWI_SVO_PrefilZero);
            db.AddInParameter(cmd, "@JOJWI_SVO_Frequency", DbType.String, dto.JOJWI_SVO_Frequency);
            db.AddInParameter(cmd, "@JOJWI_SVO_Particulars", DbType.String, dto.JOJWI_SVO_Particulars);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, dto.DeleteNumbers);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, dto.CreatorCode);
            db.AddInParameter(cmd, "@Id", DbType.Int32, dto.Id);

            return db.ExecuteDataSet(cmd);
        }

        // ---------- JOFRT setup ----------
        public DataSet JOFRT_SVO_NumberingDB(JOFRT_SVO_Numbering_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOFRT_SVO_Numbering_SP");

            db.AddInParameter(cmd, "@JOFRT_SVO_Number", DbType.Int64, dto.JOFRT_SVO_Number);
            db.AddInParameter(cmd, "@JOFRT_SVO_Method", DbType.String, dto.JOFRT_SVO_Method);
            db.AddInParameter(cmd, "@JOFRT_SVO_Date", DbType.String, dto.JOFRT_SVO_Date);
            db.AddInParameter(cmd, "@JOFRT_SVO_EndDate", DbType.String, dto.JOFRT_SVO_EndDate);
            db.AddInParameter(cmd, "@JOFRT_SVO_StartingNumber", DbType.String, dto.JOFRT_SVO_StartingNumber);
            db.AddInParameter(cmd, "@JOFRT_SVO_NumberofDigits", DbType.String, dto.JOFRT_SVO_NumberofDigits);
            db.AddInParameter(cmd, "@JOFRT_SVO_PrefilZero", DbType.String, dto.JOFRT_SVO_PrefilZero);
            db.AddInParameter(cmd, "@JOFRT_SVO_Frequency", DbType.String, dto.JOFRT_SVO_Frequency);
            db.AddInParameter(cmd, "@JOFRT_SVO_Particulars", DbType.String, dto.JOFRT_SVO_Particulars);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, dto.DeleteNumbers);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, dto.CreatorCode);
            db.AddInParameter(cmd, "@Id", DbType.Int32, dto.Id);

            return db.ExecuteDataSet(cmd);
        }

        // ---------- next number ----------
        public JOJWI_SVO_NextNumber_DTO JOJWI_SVO_NextNumberDB(JOJWI_SVO_NextNumber_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOJWI_SVO_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, dto.Id);
            db.AddInParameter(cmd, "@JOJWI_SVO_Date", DbType.Date, dto.JOJWI_SVO_Date);
            db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
            db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
            db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);
            db.ExecuteNonQuery(cmd);

            dto.NextNumber = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
            dto.Prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix"));
            dto.Suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix"));
            dto.NumberOfDigits = Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
            dto.PrefilZero = Convert.ToBoolean(db.GetParameterValue(cmd, "@PrefilZero"));

            string seq = dto.NextNumber.ToString();
            if (dto.PrefilZero) seq = seq.PadLeft(dto.NumberOfDigits, '0');
            dto.FinalNumber = dto.Prefix + seq + dto.Suffix;
            return dto;
        }

        public JOFRT_SVO_NextNumber_DTO JOFRT_SVO_NextNumberDB(JOFRT_SVO_NextNumber_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOFRT_SVO_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, dto.Id);
            db.AddInParameter(cmd, "@JOFRT_SVO_Date", DbType.Date, dto.JOFRT_SVO_Date);
            db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
            db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
            db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);
            db.ExecuteNonQuery(cmd);

            dto.NextNumber = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
            dto.Prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix"));
            dto.Suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix"));
            dto.NumberOfDigits = Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
            dto.PrefilZero = Convert.ToBoolean(db.GetParameterValue(cmd, "@PrefilZero"));

            string seq = dto.NextNumber.ToString();
            if (dto.PrefilZero) seq = seq.PadLeft(dto.NumberOfDigits, '0');
            dto.FinalNumber = dto.Prefix + seq + dto.Suffix;
            return dto;
        }

        #endregion numbering

        #region get (edit / view)
        public JOJWI_ServiceOrder_DTO JOJWI_GetServiceOrder(long JOJWI_SVOH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOJWI_ServiceOrder_Get_JSON_SP");
            db.AddInParameter(cmd, "@JOJWI_SVOH_Number", DbType.Int64, JOJWI_SVOH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            var dto = new JOJWI_ServiceOrder_DTO
            {
                Header = new JOJWI_ServiceOrderHead_DTO(),
                Items = new List<JOJWI_ServiceOrderItem_DTO>()
            };

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow r = ds.Tables[0].Rows[0];
                dto.Header.JOJWI_SVOH_Number = Convert.ToInt64(r["JOJWI_SVOH_Number"]);
                dto.Header.JOJWI_SVOH_ServiceOrderNo = r["JOJWI_SVOH_ServiceOrderNo"] as string;
                dto.Header.JOJWI_SVOH_ServiceOrderDate = Convert.ToDateTime(r["JOJWI_SVOH_ServiceOrderDate"]);
                dto.Header.JOJWI_SVOH_MS_Number = Convert.ToInt64(r["JOJWI_SVOH_MS_Number"]);
                dto.Header.JOJWI_SVOH_JW_Vendor_Number = Convert.ToInt64(r["JOJWI_SVOH_JW_Vendor_Number"]);
                dto.Header.JOJWI_SVOH_Currency_Number = Convert.ToInt64(r["JOJWI_SVOH_Currency_Number"]);
                dto.Header.JOJWI_SVOH_PaymentTerms = r["JOJWI_SVOH_PaymentTerms"] as string;
                dto.Header.JOJWI_SVOH_DeliveryTerms = r["JOJWI_SVOH_DeliveryTerms"] as string;
                dto.Header.JOJWI_SVOH_DeliveryMode = r["JOJWI_SVOH_DeliveryMode"] as string;
                dto.Header.JOJWI_SVOH_Tax = r["JOJWI_SVOH_Tax"] as string;
                dto.Header.JOJWI_SVOH_TDC = r["JOJWI_SVOH_TDC"] as string;
                dto.Header.JOJWI_SVOH_Remarks = r["JOJWI_SVOH_Remarks"] as string;
                dto.Header.JOJWI_SVOH_JW_Vendor_Name = r["JW_Vendor_Name"] as string;
            }

            if (ds.Tables.Count > 1)
            {
                foreach (DataRow r in ds.Tables[1].Rows)
                {
                    dto.Items.Add(new JOJWI_ServiceOrderItem_DTO
                    {
                        JOJWI_SVOI_Number = Convert.ToInt64(r["JOJWI_SVOI_Number"]),
                        JOJWI_SVOI_JPRS_Number = Convert.ToInt64(r["JOJWI_SVOI_JPRS_Number"]),
                        JOJWI_SVOI_Item_Number = Convert.ToInt64(r["JOJWI_SVOI_Item_Number"]),
                        JOJWI_SVOI_WH_Number = r["JOJWI_SVOI_WH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JOJWI_SVOI_WH_Number"]),
                        JOJWI_SVOI_UoM_Number = Convert.ToInt64(r["JOJWI_SVOI_UoM_Number"]),
                        JOJWI_SVOI_Qty = Convert.ToDouble(r["JOJWI_SVOI_Qty"]),
                        JOJWI_SVOI_UnitPrice = Convert.ToDouble(r["JOJWI_SVOI_UnitPrice"]),
                        JOJWI_SVOI_Amount = Convert.ToDouble(r["JOJWI_SVOI_Amount"]),
                        JOJWI_SVOI_DeliveryDate = r["JOJWI_SVOI_DeliveryDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["JOJWI_SVOI_DeliveryDate"]),
                        JOJWI_SVOI_Item_Code = r["JOJWI_SVOI_Item_Code"] as string,
                        Description = r["Description"] as string,
                        OuterDia = r["OuterDia"]?.ToString(),
                        Thickness = r["Thickness"]?.ToString(),
                        Length = r["Length"]?.ToString(),
                        Width = r["Width"]?.ToString(),
                        MaterialGrade = r["MaterialGrade"] as string,
                        ItemGroup = r["ItemGroup"] as string,
                        WarehouseCode = r["WarehouseCode"] as string,
                        AssignedQty = r["AssignedQty"] == DBNull.Value ? 0 : Convert.ToDouble(r["AssignedQty"]),
                        InvoicedQty = r["InvoicedQty"] == DBNull.Value ? 0 : Convert.ToDouble(r["InvoicedQty"]),
                        InvoiceToBeRaised = r["InvoiceToBeRaised"] == DBNull.Value ? 0 : Convert.ToDouble(r["InvoiceToBeRaised"])
                    });
                }
            }

            return dto;
        }

        public JOFRT_ServiceOrder_DTO JOFRT_GetServiceOrder(long JOFRT_SVOH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JOFRT_ServiceOrder_Get_JSON_SP");
            db.AddInParameter(cmd, "@JOFRT_SVOH_Number", DbType.Int64, JOFRT_SVOH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            var dto = new JOFRT_ServiceOrder_DTO
            {
                Header = new JOFRT_ServiceOrderHead_DTO(),
                Items = new List<JOFRT_ServiceOrderItem_DTO>()
            };

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow r = ds.Tables[0].Rows[0];
                dto.Header.JOFRT_SVOH_Number = Convert.ToInt64(r["JOFRT_SVOH_Number"]);
                dto.Header.JOFRT_SVOH_ServiceOrderNo = r["JOFRT_SVOH_ServiceOrderNo"] as string;
                dto.Header.JOFRT_SVOH_ServiceOrderDate = Convert.ToDateTime(r["JOFRT_SVOH_ServiceOrderDate"]);
                dto.Header.JOFRT_SVOH_Category = r["JOFRT_SVOH_Category"] as string;
                dto.Header.JOFRT_SVOH_JW_Vendor_Number = Convert.ToInt64(r["JOFRT_SVOH_JW_Vendor_Number"]);
                dto.Header.JOFRT_SVOH_Currency_Number = Convert.ToInt64(r["JOFRT_SVOH_Currency_Number"]);
                dto.Header.JOFRT_SVOH_PaymentTerms = r["JOFRT_SVOH_PaymentTerms"] as string;
                dto.Header.JOFRT_SVOH_DeliveryTerms = r["JOFRT_SVOH_DeliveryTerms"] as string;
                dto.Header.JOFRT_SVOH_DeliveryMode = r["JOFRT_SVOH_DeliveryMode"] as string;
                dto.Header.JOFRT_SVOH_Tax = r["JOFRT_SVOH_Tax"] as string;
                dto.Header.JOFRT_SVOH_TDC = r["JOFRT_SVOH_TDC"] as string;
                dto.Header.JOFRT_SVOH_Remarks = r["JOFRT_SVOH_Remarks"] as string;
                dto.Header.JOFRT_SVOH_JW_Vendor_Name = r["JW_Vendor_Name"] as string;
            }

            if (ds.Tables.Count > 1)
            {
                foreach (DataRow r in ds.Tables[1].Rows)
                {
                    dto.Items.Add(new JOFRT_ServiceOrderItem_DTO
                    {
                        JOFRT_SVOI_Number = Convert.ToInt64(r["JOFRT_SVOI_Number"]),
                        JOFRT_SVOI_JPRS_Number = Convert.ToInt64(r["JOFRT_SVOI_JPRS_Number"]),
                        JOFRT_SVOI_FromWH_Number = r["JOFRT_SVOI_FromWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JOFRT_SVOI_FromWH_Number"]),
                        JOFRT_SVOI_ToWH_Number = r["JOFRT_SVOI_ToWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JOFRT_SVOI_ToWH_Number"]),
                        JOFRT_SVOI_UoM_Number = Convert.ToInt64(r["JOFRT_SVOI_UoM_Number"]),
                        JOFRT_SVOI_Qty = Convert.ToDouble(r["JOFRT_SVOI_Qty"]),
                        JOFRT_SVOI_Rate = Convert.ToDouble(r["JOFRT_SVOI_Rate"]),
                        JOFRT_SVOI_Amount = Convert.ToDouble(r["JOFRT_SVOI_Amount"]),
                        AssignedQty = r["AssignedQty"] == DBNull.Value ? 0 : Convert.ToDouble(r["AssignedQty"]),
                        InvoicedQty = r["InvoicedQty"] == DBNull.Value ? 0 : Convert.ToDouble(r["InvoicedQty"]),
                        InvoiceToBeRaised = r["InvoiceToBeRaised"] == DBNull.Value ? 0 : Convert.ToDouble(r["InvoiceToBeRaised"])
                    });
                }
            }

            return dto;
        }
        #endregion
    }
}
