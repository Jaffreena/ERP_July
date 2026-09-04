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
    public class JobWorkInvoice_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        //     JW_Invoice_DL JW_Inv_DL = new JW_Invoice_DL();
        public DataSet JobWorkInvoice(JobWorkInvoiceCreate_DTO DN_DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_JobWorkInvoice_SP");

            //   int DN_Id = 10; // INSERT MODE

            // 🔹 Mode
            db.AddInParameter(cmd, "@JW_Inv_Id", DbType.Int32, DN_DTO.Header.JW_Inv_Id);

            //     DN_DTO.Header.JIJWIH_InvoiceDate = DateTime.Now;
            db.AddInParameter(cmd, "@JIJWIH_InvoiceDate", DbType.Date, DN_DTO.Header.JIJWIH_InvoiceDate);
            //db.AddInParameter(cmd, "@JIDNI_Item_Code", DbType.String, DN_DTO.Header.it);
            //db.AddInParameter(cmd, "@DN_CUS_Number", DbType.Int32, DN_DTO.Header.JIJWIH_JW_Customer_Number);
            //db.AddInParameter(cmd, "@DN_ADD_ADTP_Number", DbType.Int32, DN_DTO.Header.DN_ADD_ADTP_Number);


            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetDeliveryNoteItemsDB(long CustomerNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_GetDeliveryNoteItems_SP");

            db.AddInParameter(cmd,
                              "@CustomerNumber",
                              DbType.Int64,
                              CustomerNumber);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetDeliveryNote_GroupItem(long CustomerNumber, long MSNumber, long? JIJWIH_Number = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_GetDeliveryNote_GroupItem_SP");

            db.AddInParameter(cmd, "@CustomerNumber", DbType.Int64, CustomerNumber);
            db.AddInParameter(cmd, "@MSNumber", DbType.Int64, MSNumber);

            // NEW: NULL in Create mode (formula unaffected), actual invoice
            // number in Edit mode (adds back this invoice's own consumption)
            db.AddInParameter(cmd, "@JIJWIH_Number", DbType.Int64,
                JIJWIH_Number.HasValue ? (object)JIJWIH_Number.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        #region Header Save

        #region get default address

        public DataSet GetJWCAddressDB(long JWCNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JWC_Address_GetByJWCNumber");
            // or: "JWC_Address_Select_SP"

            db.AddInParameter(cmd,
                              "@JWC_Number",
                              DbType.Int64,
                              JWCNumber);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
        #region Get Jobwork Invoice Address

        public DataSet GetJobWorkInvoiceAddressDB(long JIJWIHNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_JobWorkInvoiceAddress_GetByJIJWIHNumber");

            db.AddInParameter(cmd,
                              "@JIJWIH_Number",
                              DbType.Int64,
                              JIJWIHNumber);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
        public void JobWorkInvoiceInsertDB(JobWorkInvoiceCreate_DTO Invoice_DTO)
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
                        long JIJWIH_Number = JobWorkInvoiceHeadInsert(
                            Invoice_DTO,
                            con,
                            tr);

                        //---------------------------------------------------
                        // ITEM INSERT
                        //---------------------------------------------------
                        DataTable insertedItems = JobWorkInvoiceItemBulkInsert(
                            JIJWIH_Number,
                            Invoice_DTO,
                            con,
                            tr);
                        // GST INSERT
                        JobWorkInvoiceGSTInsert(
                            JIJWIH_Number,
                            insertedItems,
                            Invoice_DTO,
                            con,
                            tr
                        );

                        //---------------------------------------------------
                        // ADDRESS INSERT
                        //---------------------------------------------------
                        JobWorkInvoiceAddressInsert(
                            JIJWIH_Number,
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
        public void JobWorkInvoiceGSTInsert(
long JIJWIH_Number,
DataTable insertedItems,
JobWorkInvoiceCreate_DTO Invoice_DTO,
SqlConnection con,
SqlTransaction tr)
        {
            foreach (DataRow row in insertedItems.Rows)
            {
                long itemNo =
                    Convert.ToInt64(row["JIJWII_Number"]);

                long sacNo =
                    Convert.ToInt64(row["JIJWII_SAC_Number"]);

                double amount =
                    Convert.ToDouble(row["JIJWII_Amount"]);

                //-----------------------------------
                // GST CALCULATION
                //-----------------------------------
                List<JobInwardInvoiceGst> gstRows =
                    CalculateGST(
                        Invoice_DTO.Header.JIJWIH_TCT_Number,
                        Invoice_DTO.Header.JIJWIH_InvoiceDate,
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
                        "JI_JWI_GST_Insert_SP",
                        con,
                        tr))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@JIJWIG_JIJWIH_Number", JIJWIH_Number);
                        cmd.Parameters.AddWithValue("@JIJWIG_JIJWII_Number", itemNo);
                        cmd.Parameters.AddWithValue("@JIJWIG_Index", gstIndex);
                        cmd.Parameters.AddWithValue("@JIJWIG_GSTC_Number", gst.GSTCNumber);
                        cmd.Parameters.AddWithValue("@JIJWIG_GSTT_Number", gst.GSTTNumber);
                        cmd.Parameters.AddWithValue("@JIJWIG_GSTE_Number", gst.GSTENumber);
                        cmd.Parameters.AddWithValue("@JIJWIG_AssessableValue", gst.AssessableValue);
                        cmd.Parameters.AddWithValue("@JIJWIG_Percent", gst.Percentage);
                        cmd.Parameters.AddWithValue("@JIJWIG_GST_Amount", gst.Amount);

                        cmd.ExecuteNonQuery();
                    }

                    gstIndex++;
                }
            }
        }

        public void JobWorkInvoiceAddressInsert(
long JIJWIH_Number,
List<JobWorkInvoiceAddress_DTO> addressList,
SqlConnection con,
SqlTransaction tr)
        {
            long addressNo = 1;

            foreach (var address in addressList)
            {
                using (SqlCommand cmd = new SqlCommand(
                    "JI_JobWorkInvoiceAddress_Insert_SP",
                    con,
                    tr))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@JIJWIA_JIJWIH_Number", JIJWIH_Number);

                    cmd.Parameters.AddWithValue("@JIJWIA_ADTP_Number", address.JIJWIA_ADTP_Number);
                    cmd.Parameters.AddWithValue("@JIJWIA_Address_ID", address.JIJWIA_Address_ID);
                    cmd.Parameters.AddWithValue("@JIJWIA_Address", address.JIJWIA_Address ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JIJWIA_City", address.JIJWIA_City ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JIJWIA_State", address.JIJWIA_State ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JIJWIA_Country", address.JIJWIA_Country ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JIJWIA_PIN", address.JIJWIA_PIN ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@JIJWIA_GSTIN", address.JIJWIA_GSTIN ?? (object)DBNull.Value);

                    cmd.ExecuteNonQuery();
                }

                addressNo++;
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

            List<JobInwardInvoiceGst> PurGST =
                new List<JobInwardInvoiceGst>();

            var GroupTotals =
                new Dictionary<long, double>();

            var gstList = SaleInvGstView(dt);

            if (gstList == null || !gstList.Any())
                return PurGST;

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

                    // -----------------------------
                    // FIRST LEVEL TAX (Base GST)
                    // -----------------------------
                    if (chargeable == 4 && calculation == 1)
                    {
                        if (item.Percentage.HasValue)
                        {
                            GroupTotal += baseAmount * (item.Percentage.Value / 100);
                            GroupAssessableValue += baseAmount;
                        }
                    }

                    // -----------------------------
                    // SECOND LEVEL TAX (On Tax)
                    // -----------------------------
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

                PurGST.Add(new JobInwardInvoiceGst
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

            return PurGST;
        }
        public long JobWorkInvoiceHeadInsert(
JobWorkInvoiceCreate_DTO Invoice_DTO,
SqlConnection con,
SqlTransaction tr)
        {
            long JIJWIH_Number = 0;

            using (SqlCommand cmd = new SqlCommand("JI_JobWorkInvoiceHead_Insert_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;


                cmd.Parameters.AddWithValue("@JIJWIH_InvoiceNo",
                    Invoice_DTO.Header.JIJWIH_InvoiceNo);

                cmd.Parameters.AddWithValue("@JIJWIH_InvoiceDate",
                    Invoice_DTO.Header.JIJWIH_InvoiceDate);

                cmd.Parameters.AddWithValue("@JIJWIH_JW_Customer_Number",
                    Invoice_DTO.Header.JIJWIH_JW_Customer_Number);
                cmd.Parameters.AddWithValue("@JIJWIH_MS_Number",
                   Invoice_DTO.Header.JIJWIH_MS_Number);
                cmd.Parameters.AddWithValue("@JIJWIH_Currency_Number",
                    Invoice_DTO.Header.JIJWIH_Currency_Number);

                cmd.Parameters.AddWithValue("@JIJWIH_TCT_Number",
                    Invoice_DTO.Header.JIJWIH_TCT_Number);

                cmd.Parameters.AddWithValue("@JIJWIH_PaymentTerms",
                    Invoice_DTO.Header.JIJWIH_PaymentTerms ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue("@JIJWIH_PaymentMethod",
                    Invoice_DTO.Header.JIJWIH_PaymentMethod ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue("@JIJWIH_Remarks",
                    Invoice_DTO.Header.JIJWIH_Remarks ?? (object)DBNull.Value);

                JIJWIH_Number = Convert.ToInt64(cmd.ExecuteScalar());
            }

            return JIJWIH_Number;
        }
        public DataTable JobWorkInvoiceItemBulkInsert(
long JIJWIH_Number,
JobWorkInvoiceCreate_DTO Invoice_DTO,
SqlConnection con,
SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIJWII_JIJWIH_Number", typeof(long));
            dt.Columns.Add("JIJWII_Number", typeof(long));
            dt.Columns.Add("JIJWII_JISVOI_Number", typeof(long)); // added
            dt.Columns.Add("JIJWII_JISVOH_Number", typeof(long));
            dt.Columns.Add("JIJWII_JIDNH_Number", typeof(long));
            dt.Columns.Add("JIJWII_JIDNI_Number", typeof(long));
            dt.Columns.Add("JIJWII_PRS_Number", typeof(long));
            dt.Columns.Add("JIJWII_Item_Number", typeof(long));
            dt.Columns.Add("JIJWII_UoM_Number", typeof(long));
            dt.Columns.Add("JIJWII_Qty", typeof(double));
            dt.Columns.Add("JIJWII_UnitPrice", typeof(double));
            dt.Columns.Add("JIJWII_Amount", typeof(double));
            dt.Columns.Add("JIJWII_SAC_Number", typeof(long));
            dt.Columns.Add("JIJWII_GST_Amount", typeof(double));
            dt.Columns.Add("JIJWII_SVO_Assign", typeof(string)); // NEW

            foreach (var item in Invoice_DTO.Items)
            {
                dt.Rows.Add(
                      item.JIJWII_JIJWIH_Number
                    , item.JIJWII_Number
                    , item.JIJWII_JISVOI_Number       // added
                    , item.JIJWII_JISVOH_Number
                    , item.JIJWII_JIDNH_Number
                    , item.JIJWII_JIDNI_Number
                    , item.JIJWII_PRS_Number
                    , item.JIJWII_Item_Number
                    , item.JIJWII_UoM_Number
                    , item.JIJWII_Qty
                    , item.JIJWII_UnitPrice
                    , item.JIJWII_Amount
                    , item.JIJWII_SAC_Number
                    , item.JIJWII_GST_Amount
                    , item.JIJWII_SVO_Assign    // NEW
                );
            }

            using (SqlCommand cmd = new SqlCommand(
                "JI_JobWorkInvoiceItem_BulkInsert_SP",
                con,
                tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_Number",
                    JIJWIH_Number);

                SqlParameter tvp = cmd.Parameters.AddWithValue(
                    "@Items",
                    dt);

                tvp.SqlDbType = SqlDbType.Structured;
                tvp.TypeName = "dbo.JobWorkInvoiceItemType";

                DataTable insertedItems = new DataTable();

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(insertedItems);
                }

                return insertedItems;
            }
        }
        #endregion

        #region GET DELIVERY NOTE FOR INVOICE

        public DataSet GetDeliveryNote_ForInvoice(long CustomerNumber, string DNNumbers)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_DeliveryNote_ForInvoice_SP");

            #region PARAMETERS

            db.AddInParameter(cmd,
                              "@CustomerNumber",
                              DbType.Int64,
                              CustomerNumber);

            db.AddInParameter(cmd,
                              "@DNNumbers",
                              DbType.String,
                              DNNumbers);

            #endregion

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region taxcluster
        public DataSet Get_JW_Invoice_Taxcluster(long JWC_Number, DateTime CheckDate)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("Get_JW_Invoice_Taxcluster");

            #region PARAMETERS

            db.AddInParameter(cmd,
                              "@JWC_Number",
                              DbType.Int64,
                              JWC_Number);

            db.AddInParameter(cmd,
                              "@CheckDate",
                              DbType.Date,
                              CheckDate);

            #endregion

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region taxcluster

        public DataSet GetTaxClusterCalculation(long JW_INV_TCT_Number,
                                                long JW_INV_SAC_Number,
                                                int JW_INV_InvoiceDate)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_GetTaxClusterCalculation_SP");

            #region PARAMETERS

            db.AddInParameter(cmd,
                              "@JW_INV_TCT_Number",
                              DbType.Int64,
                              JW_INV_TCT_Number);

            db.AddInParameter(cmd,
                              "@JW_INV_SAC_Number",
                              DbType.Int64,
                              JW_INV_SAC_Number);

            db.AddInParameter(cmd,
                              "@JW_INV_InvoiceDate",
                              DbType.Int32,
                              JW_INV_InvoiceDate);

            #endregion

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region taxcluster sac

        public DataSet GetTaxClusterCalculationSAC(long JW_INV_TCT_Number,
                                                long JW_INV_SAC_Number,
                                                int JW_INV_InvoiceDate)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_GetTaxClusterSACCalculation_SP");

            #region PARAMETERS

            db.AddInParameter(cmd,
                              "@JW_INV_TCT_Number",
                              DbType.Int64,
                              JW_INV_TCT_Number);

            db.AddInParameter(cmd,
                              "@JW_INV_SAC_Number",
                              DbType.Int64,
                              JW_INV_SAC_Number);

            db.AddInParameter(cmd,
                              "@JW_INV_InvoiceDate",
                              DbType.Int32,
                              JW_INV_InvoiceDate);

            #endregion

            return db.ExecuteDataSet(cmd);
        }

        #endregion

        #region summary
        public DataSet GetJobWorkInvoiceList()
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_JobWorkInvoice_List_SP");

            return db.ExecuteDataSet(cmd);
        }
        public DataSet GetJobWorkInvoiceListDetailed()
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JI_JobWorkInvoice_ListDetailed_SP");

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region edit
        public string GetJobWorkInvoiceJSON(long JIJWIH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand("JI_JobWorkInvoice_Get_JSON_SP");

            db.AddInParameter(cmd,
                              "@JIJWIH_Number",
                              DbType.Int64,
                              JIJWIH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            StringBuilder json = new StringBuilder();

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                json.Append(row[0].ToString());
            }

            return json.ToString();
        }
        #endregion

        #region edit
        public string  GetJobworkInvoiceJSON(long JISVIH_Number)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand("JI_JobworkInvoice_Get_JSON_SP");

            db.AddInParameter(cmd,
                              "@JISVIH_Number",
                              DbType.Int64,
                              JISVIH_Number);

            DataSet ds = db.ExecuteDataSet(cmd);

            StringBuilder json = new StringBuilder();

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                json.Append(row[0].ToString());
            }

            return json.ToString();
        }
        #endregion

        #region update header
        public void JobWorkInvoiceHeaderUpdate(
JobWorkInvoiceCreate_DTO DN_DTO,
SqlConnection con,
SqlTransaction tr)
        {
            using (SqlCommand cmd = new SqlCommand(
                "JI_JobWorkInvoiceHead_Update_SP",
                con,
                tr))
            {
                cmd.CommandType =
                    CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_Number",
                    DN_DTO.Header.JIJWIH_Number);
                cmd.Parameters.AddWithValue(
                "@JIJWIH_MS_Number",
                DN_DTO.Header.JIJWIH_MS_Number);


                cmd.Parameters.AddWithValue(
                    "@JIJWIH_InvoiceNo",
                    DN_DTO.Header.JIJWIH_InvoiceNo);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_InvoiceDate",
                    DN_DTO.Header.JIJWIH_InvoiceDate);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_JW_Customer_Number",
                    DN_DTO.Header.JIJWIH_JW_Customer_Number);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_Currency_Number",
                    DN_DTO.Header.JIJWIH_Currency_Number);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_TCT_Number",
                    DN_DTO.Header.JIJWIH_TCT_Number);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_PaymentTerms",
                    DN_DTO.Header.JIJWIH_PaymentTerms
                    ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_PaymentMethod",
                    DN_DTO.Header.JIJWIH_PaymentMethod
                    ?? (object)DBNull.Value);

                cmd.Parameters.AddWithValue(
                    "@JIJWIH_Remarks",
                    DN_DTO.Header.JIJWIH_Remarks
                    ?? (object)DBNull.Value);

                cmd.ExecuteNonQuery();
            }
        }
        #endregion
        public void JobWorkInvoiceUpdateDB(
    JobWorkInvoiceCreate_DTO DN_DTO)
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
                        JobWorkInvoiceHeaderUpdate(
                            DN_DTO,
                            con,
                            tr);

                        // Uncomment when item/address update is ready

                        JobWorkInvoiceItemBulkUpdate(
                            DN_DTO,
                            con,
                            tr);

                        JobWorkInvoiceAddressBulkUpdate(
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

        #region update items
        public void JobWorkInvoiceItemBulkUpdate(
    JobWorkInvoiceCreate_DTO DN_DTO,
    SqlConnection con,
    SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIJWII_JIJWIH_Number", typeof(long));   // 1
            dt.Columns.Add("JIJWII_Number", typeof(long));          // 2
            dt.Columns.Add("JIJWII_JISVOI_Number", typeof(long));   // 3 <-- Missing
            dt.Columns.Add("JIJWII_JISVOH_Number", typeof(long));   // 4
            dt.Columns.Add("JIJWII_JIDNH_Number", typeof(long));    // 5
            dt.Columns.Add("JIJWII_JIDNI_Number", typeof(long));    // 6
            dt.Columns.Add("JIJWII_PRS_Number", typeof(long));      // 7
            dt.Columns.Add("JIJWII_Item_Number", typeof(long));     // 8
            dt.Columns.Add("JIJWII_UoM_Number", typeof(long));      // 9
            dt.Columns.Add("JIJWII_Qty", typeof(decimal));          // 10
            dt.Columns.Add("JIJWII_UnitPrice", typeof(decimal));    // 11
            dt.Columns.Add("JIJWII_Amount", typeof(decimal));       // 12
            dt.Columns.Add("JIJWII_SAC_Number", typeof(long));      // 13
            dt.Columns.Add("JIJWII_GST_Amount", typeof(decimal));   // 14
            dt.Columns.Add("JIJWII_SVO_Assign", typeof(string));    // 15 NEW

            foreach (var item in DN_DTO.Items)
            {
                dt.Rows.Add(
                    DN_DTO.Header.JIJWIH_Number,   // 1
                    item.JIJWII_Number,            // 2
                    item.JIJWII_JISVOI_Number,     // 3 <-- Added
                    item.JIJWII_JISVOH_Number,     // 4
                    item.JIJWII_JIDNH_Number,      // 5
                    item.JIJWII_JIDNI_Number,      // 6
                    item.JIJWII_PRS_Number,        // 7
                    item.JIJWII_Item_Number,       // 8
                    item.JIJWII_UoM_Number,        // 9
                    item.JIJWII_Qty,               // 10
                    item.JIJWII_UnitPrice,         // 11
                    item.JIJWII_Amount,            // 12
                    item.JIJWII_SAC_Number,        // 13
                    item.JIJWII_GST_Amount,        // 14
                    item.JIJWII_SVO_Assign         // 15 NEW
                );
            }

            using (SqlCommand cmd = new SqlCommand(
                "JI_JobWorkInvoiceItem_BulkUpdate_SP",
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
                    "JobWorkInvoiceItemType";

                cmd.ExecuteNonQuery();
            }
        }
        #endregion

        #region update address
        public void JobWorkInvoiceAddressBulkUpdate(
            JobWorkInvoiceCreate_DTO DN_DTO,
            SqlConnection con,
            SqlTransaction tr)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("JIJWIA_JIJWIH_Number", typeof(long));
            dt.Columns.Add("JIJWIA_ADTP_Number", typeof(long));
            dt.Columns.Add("JIJWIA_Address_ID", typeof(string));
            dt.Columns.Add("JIJWIA_Address", typeof(string));
            dt.Columns.Add("JIJWIA_City", typeof(string));
            dt.Columns.Add("JIJWIA_State", typeof(string));
            dt.Columns.Add("JIJWIA_Country", typeof(string));
            dt.Columns.Add("JIJWIA_PIN", typeof(string));
            dt.Columns.Add("JIJWIA_GSTIN", typeof(string));

            foreach (var item in DN_DTO.Addresses)
            {
                dt.Rows.Add(
                    DN_DTO.Header.JIJWIH_Number,
                    item.JIJWIA_ADTP_Number,
                    item.JIJWIA_Address_ID,
                    item.JIJWIA_Address,
                    item.JIJWIA_City,
                    item.JIJWIA_State,
                    item.JIJWIA_Country,
                    item.JIJWIA_PIN,
                    item.JIJWIA_GSTIN
                );
            }
            using (SqlCommand cmd = new SqlCommand("JI_JobWorkInvoiceAddress_Update_SP", con, tr))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@JIJWIA_JIJWIH_Number", DN_DTO.Header.JIJWIH_Number);
                SqlParameter param = cmd.Parameters.AddWithValue("@Address", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "JI_JobWorkInvoiceAddress_TableType";
                cmd.ExecuteNonQuery();
            }
        }
        #endregion

        #region MyRegion
        public DataSet GetServiceOrderItemInfo(
      long serviceOrderNo,
      long prsNumber,
      long itemNumber,
      long uomNumber)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand(
                    "JI_ServiceOrderItem_Info_SP");

            db.AddInParameter(cmd, "@JISVOI_JISVOH_Number", DbType.Int64, serviceOrderNo);
            db.AddInParameter(cmd, "@JISVOI_PRS_Number", DbType.Int64, prsNumber);
            db.AddInParameter(cmd, "@JISVOI_Item_Number", DbType.Int64, itemNumber);
            db.AddInParameter(cmd, "@JISVOI_UoM_Number", DbType.Int64, uomNumber);

            return db.ExecuteDataSet(cmd);
        }
        #endregion

        #region JIJWI Service Order Dropdown
        public DataSet GetJobWorkInvoiceServiceOrderDB(
            long customerId,
            long? prsNumber = null,
            long? itemNumber = null,
            long? uomNumber = null)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd = db.GetStoredProcCommand("JIJWI_ServiceOrder_GetByCustomer_SP");

            db.AddInParameter(cmd, "@CustomerId", DbType.Int64, customerId);

            db.AddInParameter(cmd, "@PRS_Number", DbType.Int64,
                prsNumber.HasValue ? (object)prsNumber.Value : DBNull.Value);

            db.AddInParameter(cmd, "@Item_Number", DbType.Int64,
                itemNumber.HasValue ? (object)itemNumber.Value : DBNull.Value);

            db.AddInParameter(cmd, "@UoM_Number", DbType.Int64,
                uomNumber.HasValue ? (object)uomNumber.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
        #endregion
    }
}
