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
    public class FreightInvoice_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        #region Header Insert

        public void FreightInvoiceInsertDB(FreightInvoiceCreate_DTO Invoice_DTO)
        {
            using (SqlConnection con = new SqlConnection(DB.Connection()))
            {
                con.Open();

                using (SqlTransaction tr = con.BeginTransaction())
                {
                    try
                    {
                        //---------------------------------------------------
                        // HEAD INSERT
                        //---------------------------------------------------
                        long FRTIH_Number = FreightInvoiceHeadInsert(
                            Invoice_DTO,
                            con,
                            tr);

                        //---------------------------------------------------
                        // ITEM INSERT
                        //---------------------------------------------------
                        DataTable insertedItems = FreightInvoiceItemBulkInsert(
                            FRTIH_Number,
                            Invoice_DTO,
                            con,
                            tr);

                        // GST INSERT
                        FreightInvoiceGSTInsert(
                            FRTIH_Number,
                            insertedItems,
                            Invoice_DTO,
                            con,
                            tr
                        );

                        //---------------------------------------------------
                        // ADDRESS INSERT
                        //---------------------------------------------------
                        FreightInvoiceAddressInsert(
                            FRTIH_Number,
                            Invoice_DTO.Addresses,
                            con,
                            tr);

                        //---------------------------------------------------
                        // COMMIT
                        //---------------------------------------------------
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

        public long FreightInvoiceHeadInsert(
            FreightInvoiceCreate_DTO Invoice_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            long FRTIH_Number = 0;

            using (SqlCommand cmd = new SqlCommand("JI_FreightInvoiceHead_Insert_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@FRTIH_InvoiceNo",
                    Invoice_DTO.Header.JIFTIH_InvoiceNo);

                cmd.Parameters.AddWithValue("@FRTIH_InvoiceDate",
                    Invoice_DTO.Header.JIFTIH_InvoiceDate);

                cmd.Parameters.AddWithValue("@FRTIH_JW_Customer_Number",
                    Invoice_DTO.Header.JIFTIH_JW_Customer_Number);

                cmd.Parameters.AddWithValue("@FRTIH_MS_Number",
                    Invoice_DTO.Header.JIFTIH_MS_Number);

                cmd.Parameters.AddWithValue("@FRTIH_Currency_Number",
                    Invoice_DTO.Header.JIFTIH_Currency_Number);

                cmd.Parameters.AddWithValue("@FRTIH_TCT_Number",
                    Invoice_DTO.Header.JIFTIH_TCT_Number);

                cmd.Parameters.AddWithValue("@FRTIH_PaymentTerms",
                    Invoice_DTO.Header.JIFTIH_PaymentTerms ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue("@FRTIH_PaymentMethod",
                    Invoice_DTO.Header.JIFTIH_PaymentMethod ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@FRTIH_Remarks",
                    Invoice_DTO.Header.JIFTIH_Remarks ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue("@FRTIH_SourceCategory",
                    Invoice_DTO.Header.JIFTIH_SourceCategory ?? "DELIVERY NOTE");

                FRTIH_Number = Convert.ToInt64(cmd.ExecuteScalar());
            }

            return FRTIH_Number;
        }

        #endregion

        #region Item Bulk Insert

        public DataTable FreightInvoiceItemBulkInsert(
            long FRTIH_Number,
            FreightInvoiceCreate_DTO Invoice_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("JIFTII_JIFTIH_Number", typeof(long));
            dt.Columns.Add("JIFTII_Number", typeof(long));
            dt.Columns.Add("JIFTII_JIDNH_Number", typeof(long));
            dt.Columns.Add("JIFTII_JIDNI_Number", typeof(long));
            dt.Columns.Add("JIFTII_JISVOH_Number", typeof(string));
            dt.Columns.Add("JIFTII_PRS_Number", typeof(long));
            dt.Columns.Add("JIFTII_Item_Number", typeof(long));
            dt.Columns.Add("JIFTII_UoM_Number", typeof(long));
            dt.Columns.Add("JIFTII_Qty_Kgs", typeof(double));
            dt.Columns.Add("JIFTII_Rate", typeof(double));
            dt.Columns.Add("JIFTII_Amount", typeof(double));
            dt.Columns.Add("JIFTII_SAC_Number", typeof(long));
            dt.Columns.Add("JIFTII_GST_Amount", typeof(double));
            dt.Columns.Add("JIFTII_JISVOI_Number", typeof(long));
            dt.Columns.Add("JIFTII_SVO_Assign", typeof(string));
            dt.Columns.Add("JIFTII_SourceCategory", typeof(string));
            dt.Columns.Add("JIFTII_FromWH_Number", typeof(long));
            dt.Columns.Add("JIFTII_ToWH_Number", typeof(long));

            foreach (var item in Invoice_DTO.Items)
            {
                dt.Rows.Add(
                    FRTIH_Number,
                    0,   // JIFTII_Number - always 0 on insert
                    item.JIFTII_JIDNH_Number,
                    item.JIFTII_JIDNI_Number,
                    item.JIFTII_JISVOH_Number,
                    item.JIFTII_PRS_Number,
                    item.JIFTII_Item_Number,
                    item.JIFTII_UoM_Number,
                    item.JIFTII_Qty_Kgs,
                    item.JIFTII_Rate,
                    item.JIFTII_Amount,
                    item.JIFTII_SAC_Number,
                    item.JIFTII_GST_Amount,
                    item.JIFTII_JISVOI_Number,
                    item.JIFTII_SVO_Assign,
                    item.JIFTII_SourceCategory,
                    (object)item.JIFTII_FromWH_Number ?? DBNull.Value,
                    (object)item.JIFTII_ToWH_Number ?? DBNull.Value
                );
            }
            using (SqlCommand cmd = new SqlCommand(
                "JI_FreightInvoiceItem_BulkInsert_SP",
                con,
                tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@FRTIH_Number",
                    FRTIH_Number);

                SqlParameter tvp = cmd.Parameters.AddWithValue(
                    "@Items",
                    dt);

                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.FreightInvoiceItemType";

                DataTable insertedItems = new DataTable();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(insertedItems);
                }

                return insertedItems;
            }
        }

        #endregion

        #region GST Calculate + Insert

        public void FreightInvoiceGSTInsert(
            long FRTIH_Number,
            DataTable insertedItems,
            FreightInvoiceCreate_DTO Invoice_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            foreach (DataRow row in insertedItems.Rows)
            {
                long itemNo =
    Convert.ToInt64(row["JIFTII_Number"]);

                long sacNo =
                    Convert.ToInt64(row["JIFTII_SAC_Number"]);

                double amount =
                    Convert.ToDouble(row["JIFTII_Amount"]);

                //-----------------------------------
                // GST CALCULATION (reuses same engine as Jobwork Invoice)
                //-----------------------------------
                List<JobInwardInvoiceGst> gstRows =
                    CalculateGST(
                        Invoice_DTO.Header.JIFTIH_TCT_Number,
                        Invoice_DTO.Header.JIFTIH_InvoiceDate,
                        sacNo,
                        amount
                    );

                //-----------------------------------
                // GST INSERT
                //-----------------------------------
                int gstIndex = 1;

                foreach (var gst in gstRows)
                {
                    using (SqlCommand cmd = new SqlCommand(
                        "JI_FRTI_GST_Insert_SP",
                        con,
                        tr))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FRTIG_FRTIH_Number", FRTIH_Number);
                        cmd.Parameters.AddWithValue("@FRTIG_FRTII_Number", itemNo);
                        cmd.Parameters.AddWithValue("@FRTIG_Index", gstIndex);
                        cmd.Parameters.AddWithValue("@FRTIG_GSTC_Number", gst.GSTCNumber);
                        cmd.Parameters.AddWithValue("@FRTIG_GSTT_Number", gst.GSTTNumber);
                        cmd.Parameters.AddWithValue("@FRTIG_GSTE_Number", gst.GSTENumber);
                        cmd.Parameters.AddWithValue("@FRTIG_AssessableValue", gst.AssessableValue);
                        cmd.Parameters.AddWithValue("@FRTIG_Percent", gst.Percentage);
                        cmd.Parameters.AddWithValue("@FRTIG_GST_Amount", gst.Amount);

                        cmd.ExecuteNonQuery();
                    }

                    gstIndex++;
                }
            }
        }

        public List<JobInwardInvoiceGst> SaleInvGstView(DataTable Dt)
        {
            List<JobInwardInvoiceGst> IList = new List<JobInwardInvoiceGst>();
            foreach (DataRow dr in Dt.Rows)
            {
                IList.Add(
                    new JobInwardInvoiceGst
                    {
                        TaxIndex = Convert.ToInt64(dr["TaxIndex"]),
                        GSTCNumber = dr["GSTCNumber"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(dr["GSTCNumber"]),

                        GSTTNumber = dr["GSTTNumber"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(dr["GSTTNumber"]),

                        GSTENumber = dr["GSTENumber"] == DBNull.Value
                    ? 0
                    : Convert.ToInt64(dr["GSTENumber"]),
                        TaxCategory = Convert.ToString(dr["TaxCategory"]),
                        TaxType = Convert.ToString(dr["TaxType"]),
                        TaxElement = Convert.ToString(dr["TaxElement"]),
                        TaxElementName = Convert.ToString(dr["TaxElementName"]),
                        LoadonInventory = Convert.ToString(dr["LoadonInventory"]),
                        LoadonInventoryPercent = Convert.ToString(dr["LoadonInventoryPercent"]),
                        Chargeable = Convert.ToString(dr["Chargeable"]),
                        Calculation = Convert.ToInt64(dr["Calculation"]),
                        Percentage = Convert.ToDouble(dr["Percentage"])
                    });
            }
            return IList;
        }

        public List<JobInwardInvoiceGst> CalculateGST(
            long cluster,
            DateTime invoiceDate,
            long sacNo,
            double baseAmount)
        {
            int nInvoiceDate =
                Convert.ToInt32(invoiceDate.ToString("yyyyMMdd"));

            DataTable dt = GetTaxClusterCalculation(
                cluster,
                sacNo,
                nInvoiceDate
            ).Tables[0];

            List<JobInwardInvoiceGst> InvGST =
                new List<JobInwardInvoiceGst>();

            var GroupTotals =
                new Dictionary<long, double>();

            var gstList = SaleInvGstView(dt);

            if (gstList == null || !gstList.Any())
                return InvGST;

            var TaxIndex = gstList
                .GroupBy(gst => Convert.ToInt64(gst.TaxIndex));

            foreach (var Group in TaxIndex)
            {
                double GroupTotal = 0;
                double GroupAssessableValue = 0;

                var calculationOneItems =
                    Group.Where(x => Convert.ToInt32(x.Calculation) == 1)
                         .ToList();

                if (!calculationOneItems.Any())
                    continue;

                var first = calculationOneItems.First();

                long taxElement = Convert.ToInt64(first.TaxElement);

                foreach (var item in Group)
                {
                    double BaseElementValue = 0;

                    int calculation = Convert.ToInt32(item.Calculation);
                    int chargeable = Convert.ToInt32(item.Chargeable);

                    if (chargeable == 4 && calculation == 1)
                    {
                        if (item.Percentage.HasValue)
                        {
                            GroupTotal += baseAmount * (item.Percentage.Value / 100);
                            GroupAssessableValue += baseAmount;
                        }
                    }
                    else if (calculation == 0)
                    {
                        if (GroupTotals.ContainsKey(Convert.ToInt64(item.TaxElement)))
                        {
                            BaseElementValue =
                                GroupTotals[Convert.ToInt64(item.TaxElement)];

                            if (item.Percentage.HasValue)
                            {
                                GroupTotal += BaseElementValue * (item.Percentage.Value / 100);
                                GroupAssessableValue += BaseElementValue;
                            }
                        }
                    }
                }

                InvGST.Add(new JobInwardInvoiceGst
                {
                    TaxIndex = Group.Key,

                    GSTCNumber = first.GSTCNumber ?? 0,
                    GSTTNumber = first.GSTTNumber ?? 0,
                    GSTENumber = first.GSTENumber ?? 0,

                    Percentage = first.Percentage ?? 0,

                    AssessableValue = GroupAssessableValue,
                    Amount = GroupTotal
                });

                GroupTotals[taxElement] = GroupTotal;
            }

            return InvGST;
        }

        public DataSet GetTaxClusterCalculation(long TCT_Number,
                                                long SAC_Number,
                                                int InvoiceDate)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_GetTaxClusterCalculation_SP");

            db.AddInParameter(cmd, "@JW_INV_TCT_Number", DbType.Int64, TCT_Number);
            db.AddInParameter(cmd, "@JW_INV_SAC_Number", DbType.Int64, SAC_Number);
            db.AddInParameter(cmd, "@JW_INV_InvoiceDate", DbType.Int32, InvoiceDate);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Address Insert

        public void FreightInvoiceAddressInsert(
            long FRTIH_Number,
            List<FreightInvoiceAddress_DTO> addressList,
            SqlConnection con,
            SqlTransaction tr)
        {
            foreach (var address in addressList)
            {
                using (SqlCommand cmd = new SqlCommand(
                    "JI_FreightInvoiceAddress_Insert_SP",
                    con,
                    tr))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@FRTIA_FRTIH_Number", FRTIH_Number);

                    cmd.Parameters.AddWithValue("@FRTIA_ADTP_Number", address.JIFTIA_ADTP_Number);
                    cmd.Parameters.AddWithValue("@FRTIA_Address_ID", address.JIFTIA_Address_ID);
                    cmd.Parameters.AddWithValue("@FRTIA_Address", address.JIFTIA_Address ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@FRTIA_City", address.JIFTIA_City ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@FRTIA_State", address.JIFTIA_State ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@FRTIA_Country", address.JIFTIA_Country ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@FRTIA_PIN", address.JIFTIA_PIN ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@FRTIA_GSTIN", address.JIFTIA_GSTIN ?? (object)DBNull.Value);

                    cmd.ExecuteNonQuery();
                }
            }
        }

        #endregion
        #region Update Header

        public void FreightInvoiceUpdateDB(
            FreightInvoiceCreate_DTO DN_DTO)
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
                        FreightInvoiceHeaderUpdate(
                            DN_DTO,
                            con,
                            tr);

                        FreightInvoiceItemBulkUpdate(
                            DN_DTO,
                            con,
                            tr);

                        FreightInvoiceAddressBulkUpdate(
                            DN_DTO,
                            con,
                            tr);

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

        public void FreightInvoiceHeaderUpdate(
            FreightInvoiceCreate_DTO DN_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand(
                "JI_FreightInvoiceHead_Update_SP",
                con,
                tr))
            {
                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
         "@FRTIH_Number",
         DN_DTO.Header.JIFTIH_Number);
                cmd.Parameters.AddWithValue(
                    "@FRTIH_MS_Number",
                    DN_DTO.Header.JIFTIH_MS_Number);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_InvoiceNo",
                    DN_DTO.Header.JIFTIH_InvoiceNo);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_InvoiceDate",
                    DN_DTO.Header.JIFTIH_InvoiceDate);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_JW_Customer_Number",
                    DN_DTO.Header.JIFTIH_JW_Customer_Number);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_Currency_Number",
                    DN_DTO.Header.JIFTIH_Currency_Number);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_TCT_Number",
                    DN_DTO.Header.JIFTIH_TCT_Number);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_PaymentTerms",
                    DN_DTO.Header.JIFTIH_PaymentTerms
                    ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_PaymentMethod",
                    DN_DTO.Header.JIFTIH_PaymentMethod
                    ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue(
     "@FRTIH_Remarks",
     DN_DTO.Header.JIFTIH_Remarks
     ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@FRTIH_SourceCategory",
                    DN_DTO.Header.JIFTIH_SourceCategory ?? "DELIVERY NOTE");

                cmd.ExecuteNonQuery();
            }
        }

        #endregion

        #region Update Items

        public void FreightInvoiceItemBulkUpdate(
            FreightInvoiceCreate_DTO DN_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIFTII_Number", typeof(long));
            dt.Columns.Add("JIFTII_JIFTIH_Number", typeof(long));
            dt.Columns.Add("JIFTII_JIDNH_Number", typeof(long));
            dt.Columns.Add("JIFTII_JIDNI_Number", typeof(long));
            dt.Columns.Add("JIFTII_JISVOH_Number", typeof(string));
            dt.Columns.Add("JIFTII_PRS_Number", typeof(long));
            dt.Columns.Add("JIFTII_Item_Number", typeof(long));
            dt.Columns.Add("JIFTII_UoM_Number", typeof(long));
            dt.Columns.Add("JIFTII_Qty_Kgs", typeof(decimal));
            dt.Columns.Add("JIFTII_Rate", typeof(decimal));
            dt.Columns.Add("JIFTII_Amount", typeof(decimal));
            dt.Columns.Add("JIFTII_SAC_Number", typeof(long));
            dt.Columns.Add("JIFTII_GST_Amount", typeof(decimal));
            dt.Columns.Add("JIFTII_JISVOI_Number", typeof(long));
            dt.Columns.Add("JIFTII_SVO_Assign", typeof(string));
            dt.Columns.Add("JIFTII_SourceCategory", typeof(string));
            dt.Columns.Add("JIFTII_FromWH_Number", typeof(long));
            dt.Columns.Add("JIFTII_ToWH_Number", typeof(long));

            foreach (var item in DN_DTO.Items)
            {
                dt.Rows.Add(
       item.JIFTII_Number,
       DN_DTO.Header.JIFTIH_Number,
       item.JIFTII_JIDNH_Number,
       item.JIFTII_JIDNI_Number,
                    item.JIFTII_JISVOH_Number,
                    item.JIFTII_PRS_Number,
                    item.JIFTII_Item_Number,
                    item.JIFTII_UoM_Number,
                    item.JIFTII_Qty_Kgs,
                    item.JIFTII_Rate,
                    item.JIFTII_Amount,
                    item.JIFTII_SAC_Number,
                    item.JIFTII_GST_Amount,
                    item.JIFTII_JISVOI_Number,
                    item.JIFTII_SVO_Assign,
                    item.JIFTII_SourceCategory,
                    (object)item.JIFTII_FromWH_Number ?? DBNull.Value,
                    (object)item.JIFTII_ToWH_Number ?? DBNull.Value
                );
            }

            using (SqlCommand cmd = new SqlCommand(
                "JI_FreightInvoiceItem_BulkUpdate_SP",
                con,
                tr))
            {
                cmd.CommandType =
                    CommandType.StoredProcedure;

                SqlParameter param =
                    cmd.Parameters.AddWithValue(
                        "@Items",
                        dt);

                param.SqlDbType =
                    SqlDbType.Structured;

                param.TypeName =
                    "FreightInvoiceItemType";

                cmd.ExecuteNonQuery();
            }
        }

        #endregion

        #region Update Address

        public void FreightInvoiceAddressBulkUpdate(
            FreightInvoiceCreate_DTO DN_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIFTIA_FRTIH_Number", typeof(long));
            dt.Columns.Add("JIFTIA_ADTP_Number", typeof(long));
            dt.Columns.Add("JIFTIA_Address_ID", typeof(string));
            dt.Columns.Add("JIFTIA_Address", typeof(string));
            dt.Columns.Add("JIFTIA_City", typeof(string));
            dt.Columns.Add("JIFTIA_State", typeof(string));
            dt.Columns.Add("JIFTIA_Country", typeof(string));
            dt.Columns.Add("JIFTIA_PIN", typeof(string));
            dt.Columns.Add("JIFTIA_GSTIN", typeof(string));

            foreach (var item in DN_DTO.Addresses)
            {
                dt.Rows.Add(
                    DN_DTO.Header.JIFTIH_Number,
                    item.JIFTIA_ADTP_Number,
                    item.JIFTIA_Address_ID,
                    item.JIFTIA_Address,
                    item.JIFTIA_City,
                    item.JIFTIA_State,
                    item.JIFTIA_Country,
                    item.JIFTIA_PIN,
                    item.JIFTIA_GSTIN
                );
            }
            using (SqlCommand cmd = new SqlCommand("JI_FreightInvoiceAddress_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@FRTIA_FRTIH_Number", DN_DTO.Header.JIFTIH_Number);
                SqlParameter param = cmd.Parameters.AddWithValue("@Address", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "JI_FreightInvoiceAddress_TableType";
                cmd.ExecuteNonQuery();
            }
        }

        #endregion
        #region Get JSON (Edit load)

        public string GetFreightInvoiceJSON(long FRTIH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand("JI_FreightInvoice_Get_JSON_SP");

            db.AddInParameter(cmd,
                              "@FRTIH_Number",
                              DbType.Int64,
                              FRTIH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            StringBuilder json = new StringBuilder();

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                json.Append(row[0].ToString());
            }

            return json.ToString();
        }

        #endregion

        #region Address Get

        public DataSet GetFreightInvoiceAddressDB(long FRTIHNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_FreightInvoiceAddress_GetByFRTIHNumber");

            db.AddInParameter(cmd,
                              "@FRTIH_Number",
                              DbType.Int64,
                              FRTIHNumber);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Summary / Detailed List

        public DataSet GetFreightInvoiceList()
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_FreightInvoice_List_SP");

            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetFreightInvoiceListDetailed()
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_FreightInvoice_ListDetailed_SP");

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Source: Delivery Note lookups (Freight_Applicable filtered)

        public DataSet GetDeliveryNoteItemsFreightDB(long CustomerNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_GetDeliveryNoteItems_Freight_SP");

            db.AddInParameter(cmd,
                              "@CustomerNumber",
                              DbType.Int64,
                              CustomerNumber);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetDeliveryNote_GroupItem_FreightDB(long CustomerNumber, long MSNumber)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_GetDeliveryNote_GroupItem_Freight_SP");

            db.AddInParameter(cmd, "@CustomerNumber", DbType.Int64, CustomerNumber);
            db.AddInParameter(cmd, "@MSNumber", DbType.Int64, MSNumber);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetDeliveryNote_ForFreightInvoiceDB(long CustomerNumber, string DNNumbers)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_DeliveryNote_ForFreightInvoice_SP");

            db.AddInParameter(cmd,
                              "@CustomerNumber",
                              DbType.Int64,
                              CustomerNumber);

            db.AddInParameter(cmd,
                              "@DNNumbers",
                              DbType.String,
                              DNNumbers);

            return db.ExecuteDataSet(cmd);
        }

        // NEW: Receipt Note mirror of the two DN methods above
        public DataSet GetReceiptNote_GroupItem_FreightDB(long CustomerNumber, long MSNumber)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_GetReceiptNote_GroupItem_Freight_SP");

            db.AddInParameter(cmd, "@CustomerNumber", DbType.Int64, CustomerNumber);
            db.AddInParameter(cmd, "@MSNumber", DbType.Int64, MSNumber);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetReceiptNote_ForFreightInvoiceDB(long CustomerNumber, string RNNumbers)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_ReceiptNote_ForFreightInvoice_SP");

            db.AddInParameter(cmd,
                              "@CustomerNumber",
                              DbType.Int64,
                              CustomerNumber);

            db.AddInParameter(cmd,
                              "@RNNumbers",
                              DbType.String,
                              RNNumbers);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Source: Freight Service Order dropdown

        public DataSet GetFreightServiceOrderDB(long customerId, string category, long? uomNumber = null, long? fromWH = null, long? toWH = null)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JIFRT_ServiceOrder_ForDropdown_SP");

            db.AddInParameter(cmd, "@CustomerId", DbType.Int64, customerId);
            db.AddInParameter(cmd, "@Category", DbType.String, category);
            db.AddInParameter(cmd, "@UoM_Number", DbType.Int64, uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);
            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, fromWH.HasValue ? (object)fromWH.Value : DBNull.Value);
            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, toWH.HasValue ? (object)toWH.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region Tax Cluster (reused, not Freight-specific)

        public DataSet Get_Freight_Invoice_Taxcluster(long JWC_Number, DateTime CheckDate)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("Get_JW_Invoice_Taxcluster");

            db.AddInParameter(cmd,
                              "@JWC_Number",
                              DbType.Int64,
                              JWC_Number);

            db.AddInParameter(cmd,
                              "@CheckDate",
                              DbType.Date,
                              CheckDate);

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        public DataSet FreightInvoice(FreightInvoiceCreate_DTO DN_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_FreightInvoice_SP");

            return db.ExecuteDataSet(cmd);
        }
    }
    public class FRTI_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public FRTI_NextNumber_DTO FRTINextNumberDB(FRTI_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("FRTI_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@FRTIDate", DbType.Date, DTO.FRTIDate);
                    db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
                    db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
                    db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
                    db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
                    db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);
                    db.ExecuteNonQuery(cmd);

                    DTO.NextNumber = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
                    DTO.Prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix"));
                    DTO.Suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix"));
                    DTO.NumberOfDigits = Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
                    DTO.PrefilZero = Convert.ToBoolean(db.GetParameterValue(cmd, "@PrefilZero"));

                    string seqStr = DTO.NextNumber.ToString();
                    if (DTO.PrefilZero)
                        seqStr = seqStr.PadLeft(DTO.NumberOfDigits, '0');
                    DTO.FinalFRTINumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
}
