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
    public class ServiceOrder_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        public DataSet ServiceOrderDB(JI_ServiceOrder_DTO SVO_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_ServiceOrder_SP");

            db.AddInParameter(cmd, "@SVO_Id", DbType.Int32, SVO_DTO.Header.SVO_Id);
            db.AddInParameter(cmd, "@JISVOH_RegDate", DbType.Date, SVO_DTO.Header.JISVOH_RegDate);
            db.AddInParameter(cmd, "@JWCustomer", DbType.String, SVO_DTO.Header.JISVOH_JW_Customer_Name);
            db.AddInParameter(cmd, "@JISVOI_Item_Code", DbType.String, SVO_DTO.Header.JISVOI_Item_Code);
            db.AddInParameter(cmd, "@JISVOH_MS_Number", DbType.String, SVO_DTO.Header.JISVOH_MS_Number);
            return db.ExecuteDataSet(cmd);
        }
        public DataSet ServiceOrderSummaryDB(
    ServiceOrderSummary_DTO SO_DTO)
        {
            Database db =
                new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand(
                    "JI_ServiceOrder_Summary_SP");

            // Mode
            db.AddInParameter(
                cmd,
                "@SO_Id",
                DbType.Int32,
                SO_DTO.SO_Id);

            return db.ExecuteDataSet(cmd);
        }
        public void ServiceOrderUpdateDB(JI_ServiceOrder_DTO serviceOrderDTO)
        {
            using SqlConnection con = new SqlConnection(DB.Connection());
            con.Open();

            using SqlTransaction tr = con.BeginTransaction();

            try
            {
                ServiceOrderHeadUpdate(serviceOrderDTO, con, tr);

                ServiceOrderItemUpdate(
                    serviceOrderDTO.Header.JISVOH_Number,
                    serviceOrderDTO.Items,
                    con,
                    tr);

                tr.Commit();
            }
            catch
            {
                tr.Rollback();
                throw;
            }
        }
        public void ServiceOrderInsertDB(JI_ServiceOrder_DTO serviceOrderDTO)
        {
            using (SqlConnection con =
                new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr =
                    con.BeginTransaction())
                {
                    try
                    {
                        //-----------------------------------
                        // HEADER INSERT
                        //-----------------------------------
                        long JISVOH_Number =
                            ServiceOrderHeadInsert(
                                serviceOrderDTO,
                                con,
                                tr);

                        //-----------------------------------
                        // ITEM BULK INSERT
                        //-----------------------------------
                        ServiceOrderItemBulkInsert(
                            JISVOH_Number,
                            serviceOrderDTO.Items,
                            con,
                            tr);

                        //-----------------------------------
                        // COMMIT
                        //-----------------------------------
                        tr.Commit();
                    }
                    catch
                    {
                        tr.Rollback();
                        throw;
                    }
                }
            }
        }
        private void ServiceOrderHeadUpdate(JI_ServiceOrder_DTO dto, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JI_ServiceOrderHead_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            var h = dto.Header;

            cmd.Parameters.AddWithValue("@JISVOH_Number", h.JISVOH_Number);
            cmd.Parameters.AddWithValue("@JISVOH_RegNo", h.JISVOH_RegNo);
            cmd.Parameters.AddWithValue("@JISVOH_RegDate", h.JISVOH_RegDate);
            cmd.Parameters.AddWithValue("@JISVOH_ServiceOrderNo", h.JISVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JISVOH_ServiceOrderDate", h.JISVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JISVOH_JW_Customer_Number", h.JISVOH_JW_Customer_Number);
            cmd.Parameters.AddWithValue("@JISVOH_Currency_Number", h.JISVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JISVOH_PaymentTerms", h.JISVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_DeliveryTerms", h.JISVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_DeliveryMode", h.JISVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_Tax", h.JISVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_TDC", h.JISVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_Remarks", h.JISVOH_Remarks ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_Category", h.JISVOH_Category ?? "DELIVERY NOTE");
            cmd.Parameters.AddWithValue("@JISVOH_MS_Number", (object)h.JISVOH_MS_Number ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JISVOH_Freight_Applicable", (object)h.JISVOH_Freight_Applicable ?? DBNull.Value);

            cmd.ExecuteNonQuery();
        }
        private long ServiceOrderHeadInsert(
    JI_ServiceOrder_DTO dto,
    SqlConnection con,
    SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand(
                "JI_ServiceOrderHead_Insert_SP", con, tr);

            cmd.CommandType = CommandType.StoredProcedure;

            var h = dto.Header;

            cmd.Parameters.AddWithValue("@JISVOH_RegNo", h.JISVOH_RegNo);
            cmd.Parameters.AddWithValue("@JISVOH_RegDate", h.JISVOH_RegDate);
            cmd.Parameters.AddWithValue("@JISVOH_ServiceOrderNo", h.JISVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JISVOH_ServiceOrderDate", h.JISVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JISVOH_JW_Customer_Number", h.JISVOH_JW_Customer_Number);
            cmd.Parameters.AddWithValue("@JISVOH_Currency_Number", h.JISVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JISVOH_PaymentTerms", h.JISVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_DeliveryTerms", h.JISVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_DeliveryMode", h.JISVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_Tax", h.JISVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_TDC", h.JISVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_Remarks", h.JISVOH_Remarks ?? "");
            cmd.Parameters.AddWithValue("@JISVOH_Category", h.JISVOH_Category ?? "DELIVERY NOTE");
            cmd.Parameters.AddWithValue("@JISVOH_MS_Number", (object)h.JISVOH_MS_Number ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JISVOH_Freight_Applicable", (object)h.JISVOH_Freight_Applicable ?? DBNull.Value);

            return Convert.ToInt64(cmd.ExecuteScalar());
        }
        private DataTable CreateServiceOrderItemUpdateTable(List<JI_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JISVOI_Number", typeof(long));
            dt.Columns.Add("JISVOI_PRS_Number", typeof(long));
            dt.Columns.Add("JISVOI_Item_Number", typeof(long));
            dt.Columns.Add("JISVOI_WH_Number", typeof(long));
            dt.Columns.Add("JISVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JISVOI_Qty", typeof(double));
            dt.Columns.Add("JISVOI_UnitPrice", typeof(double));
            dt.Columns.Add("JISVOI_Amount", typeof(double));
            dt.Columns.Add("JISVOI_DeliveryDate", typeof(DateTime));
            dt.Columns.Add("JISVOI_Category", typeof(string));
            dt.Columns.Add("JISVOI_FromWH", typeof(long));
            dt.Columns.Add("JISVOI_ToWH", typeof(long));

            foreach (var item in items)
            {
                if (item.JISVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JISVOI_Number"] = item.JISVOI_Number > 0 ? item.JISVOI_Number : DBNull.Value;
                row["JISVOI_PRS_Number"] = item.JISVOI_PRS_Number;
                row["JISVOI_Item_Number"] = item.JISVOI_Item_Number;
                row["JISVOI_WH_Number"] = item.JISVOI_WH_Number;
                row["JISVOI_UoM_Number"] = item.JISVOI_UoM_Number;
                row["JISVOI_Qty"] = item.JISVOI_Qty;
                row["JISVOI_UnitPrice"] = item.JISVOI_UnitPrice;
                row["JISVOI_Amount"] = item.JISVOI_Amount;
                row["JISVOI_DeliveryDate"] = item.JISVOI_DeliveryDate.HasValue ? item.JISVOI_DeliveryDate.Value : DBNull.Value;

                row["JISVOI_Category"] = item.JISVOI_Category ?? (object)DBNull.Value;
                row["JISVOI_FromWH"] = item.JISVOI_FromWH.HasValue ? item.JISVOI_FromWH.Value : DBNull.Value;
                row["JISVOI_ToWH"] = item.JISVOI_ToWH.HasValue ? item.JISVOI_ToWH.Value : DBNull.Value;

                dt.Rows.Add(row);
            }

            return dt;
        }
        private DataTable CreateServiceOrderItemTable(
    List<JI_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JISVOI_PRS_Number", typeof(long));
            dt.Columns.Add("JISVOI_Item_Number", typeof(long));
            dt.Columns.Add("JISVOI_WH_Number", typeof(long));
            dt.Columns.Add("JISVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JISVOI_Qty", typeof(double));
            dt.Columns.Add("JISVOI_UnitPrice", typeof(double));
            dt.Columns.Add("JISVOI_Amount", typeof(double));
            dt.Columns.Add("JISVOI_DeliveryDate", typeof(DateTime));
            dt.Columns.Add("JISVOI_Category", typeof(string));
            dt.Columns.Add("JISVOI_FromWH", typeof(long));
            dt.Columns.Add("JISVOI_ToWH", typeof(long));

            foreach (var item in items)
            {
                if (item.JISVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JISVOI_PRS_Number"] =
                    item.JISVOI_PRS_Number;

                row["JISVOI_Item_Number"] =
                    item.JISVOI_Item_Number;

                row["JISVOI_WH_Number"] =
                    item.JISVOI_WH_Number;

                row["JISVOI_UoM_Number"] =
                    item.JISVOI_UoM_Number;

                row["JISVOI_Qty"] =
                    item.JISVOI_Qty;

                row["JISVOI_UnitPrice"] =
                    item.JISVOI_UnitPrice;

                row["JISVOI_Amount"] =
                    item.JISVOI_Amount;

                row["JISVOI_DeliveryDate"] =
         item.JISVOI_DeliveryDate.HasValue
             ? item.JISVOI_DeliveryDate.Value
             : DBNull.Value;

                row["JISVOI_Category"] =
                    item.JISVOI_Category ?? (object)DBNull.Value;

                row["JISVOI_FromWH"] =
                    item.JISVOI_FromWH.HasValue
                        ? item.JISVOI_FromWH.Value
                        : DBNull.Value;

                row["JISVOI_ToWH"] =
                    item.JISVOI_ToWH.HasValue
                        ? item.JISVOI_ToWH.Value
                        : DBNull.Value;

                dt.Rows.Add(row);
            }

            return dt;
        }
        private void ServiceOrderItemUpdate(
            long headerNumber, List<JI_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateServiceOrderItemUpdateTable(items);

            using SqlCommand cmd = new SqlCommand("JI_ServiceOrderItem_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JISVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JI_ServiceOrderItem_Update_TableType";

            cmd.ExecuteNonQuery();
        }
        private void ServiceOrderItemBulkInsert(long headerNumber, List<JI_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateServiceOrderItemTable(items);

            using SqlCommand cmd = new SqlCommand("JI_ServiceOrderItem_BulkInsert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JISVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JI_ServiceOrderItem_TableType";

            cmd.ExecuteNonQuery();
        }
        public DataTable GetServiceOrderHead(long customerNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand(
                    "JI_Get_ServiceOrderHead_SP");

            db.AddInParameter(
                cmd,
                "@CustomerNumber",
                DbType.Int64,
                customerNumber);

            DataSet ds = db.ExecuteDataSet(cmd);

            return ds.Tables[0];
        }
        #region edit
        public string GetServiceOrderJSON(long JISVOH_Number)
        {
            Database db =
                new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand(
                    "JI_ServiceOrder_Get_JSON_SP");

            db.AddInParameter(
                cmd,
                "@JISVOH_Number",
                DbType.Int64,
                JISVOH_Number);

            string json =
                db.ExecuteScalar(cmd)?.ToString();

            return json;
        }

        public JIJWI_ServiceOrder_DTO JIJWI_GetServiceOrder(long JIJWI_SVOH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JIJWI_ServiceOrder_Get_JSON_SP");
            db.AddInParameter(cmd, "@JIJWI_SVOH_Number", DbType.Int64, JIJWI_SVOH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            var dto = new JIJWI_ServiceOrder_DTO
            {
                Header = new JIJWI_ServiceOrderHead_DTO(),
                Items = new List<JIJWI_ServiceOrderItem_DTO>()
            };

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow r = ds.Tables[0].Rows[0];
                dto.Header.JIJWI_SVOH_Number = Convert.ToInt64(r["JIJWI_SVOH_Number"]);
                dto.Header.JIJWI_SVOH_RegNo = r["JIJWI_SVOH_RegNo"] as string;
                dto.Header.JIJWI_SVOH_RegDate = Convert.ToDateTime(r["JIJWI_SVOH_RegDate"]);
                dto.Header.JIJWI_SVOH_ServiceOrderNo = r["JIJWI_SVOH_ServiceOrderNo"] as string;
                dto.Header.JIJWI_SVOH_ServiceOrderDate = Convert.ToDateTime(r["JIJWI_SVOH_ServiceOrderDate"]);
                dto.Header.JIJWI_SVOH_MS_Number = r["JIJWI_SVOH_MS_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JIJWI_SVOH_MS_Number"]);
                dto.Header.JIJWI_SVOH_JW_Customer_Number = Convert.ToInt64(r["JIJWI_SVOH_JW_Customer_Number"]);
                dto.Header.JIJWI_SVOH_Currency_Number = Convert.ToInt64(r["JIJWI_SVOH_Currency_Number"]);
                dto.Header.JIJWI_SVOH_PaymentTerms = r["JIJWI_SVOH_PaymentTerms"] as string;
                dto.Header.JIJWI_SVOH_DeliveryTerms = r["JIJWI_SVOH_DeliveryTerms"] as string;
                dto.Header.JIJWI_SVOH_DeliveryMode = r["JIJWI_SVOH_DeliveryMode"] as string;
                dto.Header.JIJWI_SVOH_Tax = r["JIJWI_SVOH_Tax"] as string;
                dto.Header.JIJWI_SVOH_TDC = r["JIJWI_SVOH_TDC"] as string;
                dto.Header.JIJWI_SVOH_Remarks = r["JIJWI_SVOH_Remarks"] as string;
                dto.Header.JIJWI_SVOH_JW_Customer_Name = r["JW_Customer_Name"] as string;
            }

            if (ds.Tables.Count > 1)
            {
                foreach (DataRow r in ds.Tables[1].Rows)
                {
                    dto.Items.Add(new JIJWI_ServiceOrderItem_DTO
                    {
                        JIJWI_SVOI_Number = Convert.ToInt64(r["JIJWI_SVOI_Number"]),
                        JIJWI_SVOI_PRS_Number = Convert.ToInt64(r["JIJWI_SVOI_PRS_Number"]),
                        JIJWI_SVOI_Item_Number = Convert.ToInt64(r["JIJWI_SVOI_Item_Number"]),
                        JIJWI_SVOI_WH_Number = r["JIJWI_SVOI_WH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JIJWI_SVOI_WH_Number"]),
                        JIJWI_SVOI_UoM_Number = Convert.ToInt64(r["JIJWI_SVOI_UoM_Number"]),
                        JIJWI_SVOI_Qty = Convert.ToDouble(r["JIJWI_SVOI_Qty"]),
                        JIJWI_SVOI_UnitPrice = Convert.ToDouble(r["JIJWI_SVOI_UnitPrice"]),
                        JIJWI_SVOI_Amount = Convert.ToDouble(r["JIJWI_SVOI_Amount"]),
                        JIJWI_SVOI_DeliveryDate = r["JIJWI_SVOI_DeliveryDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["JIJWI_SVOI_DeliveryDate"]),
                        JIJWI_SVOI_Category = r["JIJWI_SVOI_Category"] as string,
                        AssignedQty = Convert.ToDouble(r["AssignedQty"]),
                        InvoicedQty = Convert.ToDouble(r["InvoicedQty"]),
                        InvoiceToBeRaised = Convert.ToDouble(r["InvoiceToBeRaised"]),
                        JIJWI_SVOI_Item_Code = r["JIJWI_SVOI_Item_Code"] as string,
                        Description = r["Description"] as string,
                        OuterDia = r["OuterDia"]?.ToString(),
                        Thickness = r["Thickness"]?.ToString(),
                        Length = r["Length"]?.ToString(),
                        Width = r["Width"]?.ToString(),
                        MaterialGrade = r["MaterialGrade"] as string,
                        ItemGroup = r["ItemGroup"] as string
                    });
                }
            }

            return dto;
        }

        public JIFRT_ServiceOrder_DTO JIFRT_GetServiceOrder(long JIFRT_SVOH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JIFRT_ServiceOrder_Get_JSON_SP");
            db.AddInParameter(cmd, "@JIFRT_SVOH_Number", DbType.Int64, JIFRT_SVOH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            var dto = new JIFRT_ServiceOrder_DTO
            {
                Header = new JIFRT_ServiceOrderHead_DTO(),
                Items = new List<JIFRT_ServiceOrderItem_DTO>()
            };

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow r = ds.Tables[0].Rows[0];
                dto.Header.JIFRT_SVOH_Number = Convert.ToInt64(r["JIFRT_SVOH_Number"]);
                dto.Header.JIFRT_SVOH_RegNo = r["JIFRT_SVOH_RegNo"] as string;
                dto.Header.JIFRT_SVOH_RegDate = Convert.ToDateTime(r["JIFRT_SVOH_RegDate"]);
                dto.Header.JIFRT_SVOH_ServiceOrderNo = r["JIFRT_SVOH_ServiceOrderNo"] as string;
                dto.Header.JIFRT_SVOH_ServiceOrderDate = Convert.ToDateTime(r["JIFRT_SVOH_ServiceOrderDate"]);
                dto.Header.JIFRT_SVOH_Category = r["JIFRT_SVOH_Category"] as string;
                dto.Header.JIFRT_SVOH_JW_Customer_Number = Convert.ToInt64(r["JIFRT_SVOH_JW_Customer_Number"]);
                dto.Header.JIFRT_SVOH_Currency_Number = Convert.ToInt64(r["JIFRT_SVOH_Currency_Number"]);
                dto.Header.JIFRT_SVOH_PaymentTerms = r["JIFRT_SVOH_PaymentTerms"] as string;
                dto.Header.JIFRT_SVOH_DeliveryTerms = r["JIFRT_SVOH_DeliveryTerms"] as string;
                dto.Header.JIFRT_SVOH_DeliveryMode = r["JIFRT_SVOH_DeliveryMode"] as string;
                dto.Header.JIFRT_SVOH_Tax = r["JIFRT_SVOH_Tax"] as string;
                dto.Header.JIFRT_SVOH_TDC = r["JIFRT_SVOH_TDC"] as string;
                dto.Header.JIFRT_SVOH_Remarks = r["JIFRT_SVOH_Remarks"] as string;
                dto.Header.JIFRT_SVOH_JW_Customer_Name = r["JW_Customer_Name"] as string;
            }

            if (ds.Tables.Count > 1)
            {
                foreach (DataRow r in ds.Tables[1].Rows)
                {
                    dto.Items.Add(new JIFRT_ServiceOrderItem_DTO
                    {
                        JIFRT_SVOI_Number = Convert.ToInt64(r["JIFRT_SVOI_Number"]),
                        JIFRT_SVOI_Category = r["JIFRT_SVOI_Category"] as string,
                        JIFRT_SVOI_PRS_Number = Convert.ToInt64(r["JIFRT_SVOI_PRS_Number"]),
                        JIFRT_SVOI_FromWH_Number = r["JIFRT_SVOI_FromWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JIFRT_SVOI_FromWH_Number"]),
                        JIFRT_SVOI_ToWH_Number = r["JIFRT_SVOI_ToWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(r["JIFRT_SVOI_ToWH_Number"]),
                        JIFRT_SVOI_UoM_Number = Convert.ToInt64(r["JIFRT_SVOI_UoM_Number"]),
                        JIFRT_SVOI_Qty = Convert.ToDouble(r["JIFRT_SVOI_Qty"]),
                        JIFRT_SVOI_Rate = Convert.ToDouble(r["JIFRT_SVOI_Rate"]),
                        JIFRT_SVOI_Amount = Convert.ToDouble(r["JIFRT_SVOI_Amount"])
                    });
                }
            }

            return dto;
        }
        #endregion


        #region new service order

        public long JIJWI_ServiceOrderInsertDB(JIJWI_ServiceOrder_DTO dto)
        {
            long headNumber = 0;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        headNumber = JIJWI_ServiceOrderHeadInsert(dto.Header, con, tr);
                        JIJWI_ServiceOrderItemBulkInsert(headNumber, dto.Items, con, tr);

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

        public long JIFRT_ServiceOrderInsertDB(JIFRT_ServiceOrder_DTO dto)
        {
            long headNumber = 0;

            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        headNumber = JIFRT_ServiceOrderHeadInsert(dto.Header, con, tr);
                        JIFRT_ServiceOrderItemBulkInsert(headNumber, dto.Items, con, tr);

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

        private long JIJWI_ServiceOrderHeadInsert(JIJWI_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JIJWI_ServiceOrderHead_Insert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIJWI_SVOH_RegNo", h.JIJWI_SVOH_RegNo);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_RegDate", h.JIJWI_SVOH_RegDate);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_ServiceOrderNo", h.JIJWI_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_ServiceOrderDate", h.JIJWI_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_MS_Number", (object)h.JIJWI_SVOH_MS_Number ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_JW_Customer_Number", h.JIJWI_SVOH_JW_Customer_Number);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Currency_Number", h.JIJWI_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_PaymentTerms", h.JIJWI_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_DeliveryTerms", h.JIJWI_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_DeliveryMode", h.JIJWI_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Tax", h.JIJWI_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_TDC", h.JIJWI_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Remarks", h.JIJWI_SVOH_Remarks ?? "");

            SqlParameter outParam = new SqlParameter("@NewNumber", SqlDbType.BigInt) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(outParam);

            cmd.ExecuteNonQuery();
            return Convert.ToInt64(outParam.Value);
        }

        private long JIFRT_ServiceOrderHeadInsert(JIFRT_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JIFRT_ServiceOrderHead_Insert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIFRT_SVOH_RegNo", h.JIFRT_SVOH_RegNo);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_RegDate", h.JIFRT_SVOH_RegDate);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_ServiceOrderNo", h.JIFRT_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_ServiceOrderDate", h.JIFRT_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Category", h.JIFRT_SVOH_Category ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_JW_Customer_Number", h.JIFRT_SVOH_JW_Customer_Number);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Currency_Number", h.JIFRT_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_PaymentTerms", h.JIFRT_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_DeliveryTerms", h.JIFRT_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_DeliveryMode", h.JIFRT_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Tax", h.JIFRT_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_TDC", h.JIFRT_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Remarks", h.JIFRT_SVOH_Remarks ?? "");

            SqlParameter outParam = new SqlParameter("@NewNumber", SqlDbType.BigInt) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(outParam);

            cmd.ExecuteNonQuery();
            return Convert.ToInt64(outParam.Value);
        }

        private DataTable CreateJIJWIServiceOrderItemTable(List<JIJWI_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIJWI_SVOI_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_PRS_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_Item_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_WH_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_Qty", typeof(double));
            dt.Columns.Add("JIJWI_SVOI_UnitPrice", typeof(double));
            dt.Columns.Add("JIJWI_SVOI_Amount", typeof(double));
            dt.Columns.Add("JIJWI_SVOI_DeliveryDate", typeof(DateTime));
            dt.Columns.Add("JIJWI_SVOI_Category", typeof(string));

            foreach (var item in items)
            {
                if (item.JIJWI_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JIJWI_SVOI_Number"] = item.JIJWI_SVOI_Number > 0 ? item.JIJWI_SVOI_Number : (object)DBNull.Value;
                row["JIJWI_SVOI_PRS_Number"] = item.JIJWI_SVOI_PRS_Number;
                row["JIJWI_SVOI_Item_Number"] = item.JIJWI_SVOI_Item_Number;
                row["JIJWI_SVOI_WH_Number"] = item.JIJWI_SVOI_WH_Number.HasValue ? item.JIJWI_SVOI_WH_Number.Value : DBNull.Value;
                row["JIJWI_SVOI_UoM_Number"] = item.JIJWI_SVOI_UoM_Number;
                row["JIJWI_SVOI_Qty"] = item.JIJWI_SVOI_Qty;
                row["JIJWI_SVOI_UnitPrice"] = item.JIJWI_SVOI_UnitPrice;
                row["JIJWI_SVOI_Amount"] = item.JIJWI_SVOI_Amount;
                row["JIJWI_SVOI_DeliveryDate"] = item.JIJWI_SVOI_DeliveryDate.HasValue ? item.JIJWI_SVOI_DeliveryDate.Value : DBNull.Value;
                row["JIJWI_SVOI_Category"] = item.JIJWI_SVOI_Category ?? "DELIVERY NOTE";

                dt.Rows.Add(row);
            }

            return dt;
        }

        private DataTable CreateJIFRTServiceOrderItemTable(List<JIFRT_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIFRT_SVOI_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_Category", typeof(string));
            dt.Columns.Add("JIFRT_SVOI_PRS_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_FromWH_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_ToWH_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_Qty", typeof(double));
            dt.Columns.Add("JIFRT_SVOI_Rate", typeof(double));
            dt.Columns.Add("JIFRT_SVOI_Amount", typeof(double));

            foreach (var item in items)
            {
                if (item.JIFRT_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JIFRT_SVOI_Number"] = item.JIFRT_SVOI_Number > 0 ? item.JIFRT_SVOI_Number : (object)DBNull.Value;
                row["JIFRT_SVOI_Category"] = item.JIFRT_SVOI_Category ?? (object)DBNull.Value;
                row["JIFRT_SVOI_PRS_Number"] = item.JIFRT_SVOI_PRS_Number;
                row["JIFRT_SVOI_FromWH_Number"] = item.JIFRT_SVOI_FromWH_Number.HasValue ? item.JIFRT_SVOI_FromWH_Number.Value : DBNull.Value;
                row["JIFRT_SVOI_ToWH_Number"] = item.JIFRT_SVOI_ToWH_Number.HasValue ? item.JIFRT_SVOI_ToWH_Number.Value : DBNull.Value;
                row["JIFRT_SVOI_UoM_Number"] = item.JIFRT_SVOI_UoM_Number;
                row["JIFRT_SVOI_Qty"] = item.JIFRT_SVOI_Qty;
                row["JIFRT_SVOI_Rate"] = item.JIFRT_SVOI_Rate;
                row["JIFRT_SVOI_Amount"] = item.JIFRT_SVOI_Amount;

                dt.Rows.Add(row);
            }

            return dt;
        }

        private void JIJWI_ServiceOrderItemBulkInsert(long headerNumber, List<JIJWI_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJIJWIServiceOrderItemTable(items);

            using SqlCommand cmd = new SqlCommand("JIJWI_ServiceOrderItem_BulkInsert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JIJWI_ServiceOrderItemType";

            cmd.ExecuteNonQuery();
        }

        private void JIFRT_ServiceOrderItemBulkInsert(long headerNumber, List<JIFRT_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJIFRTServiceOrderItemTable(items);

            using SqlCommand cmd = new SqlCommand("JIFRT_ServiceOrderItem_BulkInsert_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JIFRT_ServiceOrderItemType";

            cmd.ExecuteNonQuery();
        }

        #endregion

        #region update service order (JIJWI / JIFRT)

        public void JIJWI_ServiceOrderUpdateDB(JIJWI_ServiceOrder_DTO dto)
        {
            using SqlConnection con = new SqlConnection(DB.Connection());
            con.Open();

            using SqlTransaction tr = con.BeginTransaction();
            try
            {
                JIJWI_ServiceOrderHeadUpdate(dto.Header, con, tr);
                JIJWI_ServiceOrderItemUpdate(dto.Header.JIJWI_SVOH_Number, dto.Items, con, tr);

                tr.Commit();
            }
            catch
            {
                tr.Rollback();
                throw;
            }
        }

        public void JIFRT_ServiceOrderUpdateDB(JIFRT_ServiceOrder_DTO dto)
        {
            using SqlConnection con = new SqlConnection(DB.Connection());
            con.Open();

            using SqlTransaction tr = con.BeginTransaction();
            try
            {
                JIFRT_ServiceOrderHeadUpdate(dto.Header, con, tr);
                JIFRT_ServiceOrderItemUpdate(dto.Header.JIFRT_SVOH_Number, dto.Items, con, tr);

                tr.Commit();
            }
            catch
            {
                tr.Rollback();
                throw;
            }
        }

        private void JIJWI_ServiceOrderHeadUpdate(JIJWI_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JIJWI_ServiceOrderHead_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Number", h.JIJWI_SVOH_Number);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_RegNo", h.JIJWI_SVOH_RegNo);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_RegDate", h.JIJWI_SVOH_RegDate);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_ServiceOrderNo", h.JIJWI_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_ServiceOrderDate", h.JIJWI_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_MS_Number", (object)h.JIJWI_SVOH_MS_Number ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_JW_Customer_Number", h.JIJWI_SVOH_JW_Customer_Number);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Currency_Number", h.JIJWI_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_PaymentTerms", h.JIJWI_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_DeliveryTerms", h.JIJWI_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_DeliveryMode", h.JIJWI_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Tax", h.JIJWI_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_TDC", h.JIJWI_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Remarks", h.JIJWI_SVOH_Remarks ?? "");

            cmd.ExecuteNonQuery();
        }

        private void JIFRT_ServiceOrderHeadUpdate(JIFRT_ServiceOrderHead_DTO h, SqlConnection con, SqlTransaction tr)
        {
            using SqlCommand cmd = new SqlCommand("JIFRT_ServiceOrderHead_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Number", h.JIFRT_SVOH_Number);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_RegNo", h.JIFRT_SVOH_RegNo);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_RegDate", h.JIFRT_SVOH_RegDate);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_ServiceOrderNo", h.JIFRT_SVOH_ServiceOrderNo);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_ServiceOrderDate", h.JIFRT_SVOH_ServiceOrderDate);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Category", h.JIFRT_SVOH_Category ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_JW_Customer_Number", h.JIFRT_SVOH_JW_Customer_Number);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Currency_Number", h.JIFRT_SVOH_Currency_Number);
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_PaymentTerms", h.JIFRT_SVOH_PaymentTerms ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_DeliveryTerms", h.JIFRT_SVOH_DeliveryTerms ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_DeliveryMode", h.JIFRT_SVOH_DeliveryMode ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Tax", h.JIFRT_SVOH_Tax ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_TDC", h.JIFRT_SVOH_TDC ?? "");
            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Remarks", h.JIFRT_SVOH_Remarks ?? "");

            cmd.ExecuteNonQuery();
        }

        private void JIJWI_ServiceOrderItemUpdate(long headerNumber, List<JIJWI_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJIJWIServiceOrderItemUpdateTable(items);

            using SqlCommand cmd = new SqlCommand("JIJWI_ServiceOrderItem_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIJWI_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JIJWI_ServiceOrderItem_Update_TableType";

            cmd.ExecuteNonQuery();
        }

        private void JIFRT_ServiceOrderItemUpdate(long headerNumber, List<JIFRT_ServiceOrderItem_DTO> items, SqlConnection con, SqlTransaction tr)
        {
            DataTable dt = CreateJIFRTServiceOrderItemUpdateTable(items);

            using SqlCommand cmd = new SqlCommand("JIFRT_ServiceOrderItem_Update_SP", con, tr);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@JIFRT_SVOH_Number", headerNumber);

            SqlParameter param = cmd.Parameters.AddWithValue("@Items", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "dbo.JIFRT_ServiceOrderItem_Update_TableType";

            cmd.ExecuteNonQuery();
        }

        private DataTable CreateJIJWIServiceOrderItemUpdateTable(List<JIJWI_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIJWI_SVOI_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_PRS_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_Item_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_WH_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JIJWI_SVOI_Qty", typeof(double));
            dt.Columns.Add("JIJWI_SVOI_UnitPrice", typeof(double));
            dt.Columns.Add("JIJWI_SVOI_Amount", typeof(double));
            dt.Columns.Add("JIJWI_SVOI_DeliveryDate", typeof(DateTime));
            dt.Columns.Add("JIJWI_SVOI_Category", typeof(string));

            foreach (var item in items)
            {
                if (item.JIJWI_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JIJWI_SVOI_Number"] = item.JIJWI_SVOI_Number > 0 ? item.JIJWI_SVOI_Number : (object)DBNull.Value;
                row["JIJWI_SVOI_PRS_Number"] = item.JIJWI_SVOI_PRS_Number;
                row["JIJWI_SVOI_Item_Number"] = item.JIJWI_SVOI_Item_Number;
                row["JIJWI_SVOI_WH_Number"] = item.JIJWI_SVOI_WH_Number.HasValue ? item.JIJWI_SVOI_WH_Number.Value : DBNull.Value;
                row["JIJWI_SVOI_UoM_Number"] = item.JIJWI_SVOI_UoM_Number;
                row["JIJWI_SVOI_Qty"] = item.JIJWI_SVOI_Qty;
                row["JIJWI_SVOI_UnitPrice"] = item.JIJWI_SVOI_UnitPrice;
                row["JIJWI_SVOI_Amount"] = item.JIJWI_SVOI_Amount;
                row["JIJWI_SVOI_DeliveryDate"] = item.JIJWI_SVOI_DeliveryDate.HasValue ? item.JIJWI_SVOI_DeliveryDate.Value : DBNull.Value;
                row["JIJWI_SVOI_Category"] = item.JIJWI_SVOI_Category ?? "DELIVERY NOTE";

                dt.Rows.Add(row);
            }

            return dt;
        }

        private DataTable CreateJIFRTServiceOrderItemUpdateTable(List<JIFRT_ServiceOrderItem_DTO> items)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIFRT_SVOI_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_Category", typeof(string));
            dt.Columns.Add("JIFRT_SVOI_PRS_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_FromWH_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_ToWH_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_UoM_Number", typeof(long));
            dt.Columns.Add("JIFRT_SVOI_Qty", typeof(double));
            dt.Columns.Add("JIFRT_SVOI_Rate", typeof(double));
            dt.Columns.Add("JIFRT_SVOI_Amount", typeof(double));

            foreach (var item in items)
            {
                if (item.JIFRT_SVOI_IsDeleted)
                    continue;

                DataRow row = dt.NewRow();

                row["JIFRT_SVOI_Number"] = item.JIFRT_SVOI_Number > 0 ? item.JIFRT_SVOI_Number : (object)DBNull.Value;
                row["JIFRT_SVOI_Category"] = item.JIFRT_SVOI_Category ?? (object)DBNull.Value;
                row["JIFRT_SVOI_PRS_Number"] = item.JIFRT_SVOI_PRS_Number;
                row["JIFRT_SVOI_FromWH_Number"] = item.JIFRT_SVOI_FromWH_Number.HasValue ? item.JIFRT_SVOI_FromWH_Number.Value : DBNull.Value;
                row["JIFRT_SVOI_ToWH_Number"] = item.JIFRT_SVOI_ToWH_Number.HasValue ? item.JIFRT_SVOI_ToWH_Number.Value : DBNull.Value;
                row["JIFRT_SVOI_UoM_Number"] = item.JIFRT_SVOI_UoM_Number;
                row["JIFRT_SVOI_Qty"] = item.JIFRT_SVOI_Qty;
                row["JIFRT_SVOI_Rate"] = item.JIFRT_SVOI_Rate;
                row["JIFRT_SVOI_Amount"] = item.JIFRT_SVOI_Amount;

                dt.Rows.Add(row);
            }

            return dt;
        }

        #endregion

        #region SVO Numbering

        public DataSet JIJWI_SVO_NumberingDB(JIJWI_SVO_Numbering_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JIJWI_SVO_Numbering_SP");

            db.AddInParameter(cmd, "@JIJWI_SVO_Number", DbType.Int64, dto.JIJWI_SVO_Number);
            db.AddInParameter(cmd, "@JIJWI_SVO_Method", DbType.String, dto.JIJWI_SVO_Method);
            db.AddInParameter(cmd, "@JIJWI_SVO_Date", DbType.String, dto.JIJWI_SVO_Date);
            db.AddInParameter(cmd, "@JIJWI_SVO_EndDate", DbType.String, dto.JIJWI_SVO_EndDate);
            db.AddInParameter(cmd, "@JIJWI_SVO_StartingNumber", DbType.String, dto.JIJWI_SVO_StartingNumber);
            db.AddInParameter(cmd, "@JIJWI_SVO_NumberofDigits", DbType.String, dto.JIJWI_SVO_NumberofDigits);
            db.AddInParameter(cmd, "@JIJWI_SVO_PrefilZero", DbType.String, dto.JIJWI_SVO_PrefilZero);
            db.AddInParameter(cmd, "@JIJWI_SVO_Frequency", DbType.String, dto.JIJWI_SVO_Frequency);
            db.AddInParameter(cmd, "@JIJWI_SVO_Particulars", DbType.String, dto.JIJWI_SVO_Particulars);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, dto.DeleteNumbers);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, dto.CreatorCode);
            db.AddInParameter(cmd, "@Id", DbType.Int32, dto.Id);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet JIFRT_SVO_NumberingDB(JIFRT_SVO_Numbering_DTO dto)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JIFRT_SVO_Numbering_SP");

            db.AddInParameter(cmd, "@JIFRT_SVO_Number", DbType.Int64, dto.JIFRT_SVO_Number);
            db.AddInParameter(cmd, "@JIFRT_SVO_Method", DbType.String, dto.JIFRT_SVO_Method);
            db.AddInParameter(cmd, "@JIFRT_SVO_Date", DbType.String, dto.JIFRT_SVO_Date);
            db.AddInParameter(cmd, "@JIFRT_SVO_EndDate", DbType.String, dto.JIFRT_SVO_EndDate);
            db.AddInParameter(cmd, "@JIFRT_SVO_StartingNumber", DbType.String, dto.JIFRT_SVO_StartingNumber);
            db.AddInParameter(cmd, "@JIFRT_SVO_NumberofDigits", DbType.String, dto.JIFRT_SVO_NumberofDigits);
            db.AddInParameter(cmd, "@JIFRT_SVO_PrefilZero", DbType.String, dto.JIFRT_SVO_PrefilZero);
            db.AddInParameter(cmd, "@JIFRT_SVO_Frequency", DbType.String, dto.JIFRT_SVO_Frequency);
            db.AddInParameter(cmd, "@JIFRT_SVO_Particulars", DbType.String, dto.JIFRT_SVO_Particulars);
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, dto.DeleteNumbers);
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, dto.CreatorCode);
            db.AddInParameter(cmd, "@Id", DbType.Int32, dto.Id);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region register
        public DataSet JIJWIServiceOrderSummaryDB(
    JIJWIServiceOrderSummary_DTO SO_DTO)
        {
            Database db =
                new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand(
                    "JIJWI_ServiceOrder_Summary_SP");

            // Mode
            db.AddInParameter(
                cmd,
                "@SO_Id",
                DbType.Int32,
                SO_DTO.SO_Id);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet JIFRTServiceOrderSummaryDB(
            JIFRTServiceOrderSummary_DTO SO_DTO)
        {
            Database db =
                new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand(
                    "JIFRT_ServiceOrder_Summary_SP");

            // Mode
            db.AddInParameter(
                cmd,
                "@SO_Id",
                DbType.Int32,
                SO_DTO.SO_Id);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

    }
}