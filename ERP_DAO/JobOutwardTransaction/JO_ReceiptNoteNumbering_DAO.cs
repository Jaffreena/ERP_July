using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JO_RN_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();

        public JO_RN_NextNumber_DTO JORNNextNumberDB(JO_RN_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_RN_GetNextNumber_SP");

            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);
            db.AddInParameter(cmd, "@RNDate", DbType.Date, DTO.RNDate);
            db.AddOutParameter(cmd, "@NextNumber", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@Prefix", DbType.String, 30);
            db.AddOutParameter(cmd, "@Suffix", DbType.String, 30);
            db.AddOutParameter(cmd, "@NumberOfDigits", DbType.Int32, 4);
            db.AddOutParameter(cmd, "@PrefilZero", DbType.Boolean, 1);

            db.ExecuteNonQuery(cmd);

            int next = Convert.ToInt32(db.GetParameterValue(cmd, "@NextNumber"));
            string prefix = Convert.ToString(db.GetParameterValue(cmd, "@Prefix")) ?? "";
            string suffix = Convert.ToString(db.GetParameterValue(cmd, "@Suffix")) ?? "";
            int digits = Convert.ToInt32(db.GetParameterValue(cmd, "@NumberOfDigits"));
            object pz = db.GetParameterValue(cmd, "@PrefilZero");
            bool prefill = pz != DBNull.Value && Convert.ToBoolean(pz);

            DTO.FinalRNNumber = prefix + (prefill ? next.ToString("D" + digits) : next.ToString()) + suffix;
            return DTO;
        }
    }

    public class JORN_Numbering_DAO
    {
        DBConnect DB = new DBConnect();

        private static long N(string? s)
        {
            return long.TryParse(s, out var v) ? v : 0;
        }

        public DataSet JORN_NumberingDB(JORNNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JORN_Numbering_SP");

            db.AddInParameter(cmd, "@RNN_Number", DbType.Int64, DTO.RNN_Number);
            db.AddInParameter(cmd, "@RNN_Method", DbType.Int64, N(DTO.RNN_Method));
            db.AddInParameter(cmd, "@RNN_Date", DbType.Int32, (int)N(DTO.RNN_Date));
            db.AddInParameter(cmd, "@RNN_EndDate", DbType.Int32, (int)N(DTO.RNN_EndDate));
            db.AddInParameter(cmd, "@RNN_StartingNumber", DbType.Int32, (int)N(DTO.RNN_StartingNumber));
            db.AddInParameter(cmd, "@RNN_NumberofDigits", DbType.Int32, (int)N(DTO.RNN_NumberofDigits));
            db.AddInParameter(cmd, "@RNN_PrefilZero", DbType.Int64, N(DTO.RNN_PrefilZero));
            db.AddInParameter(cmd, "@RNN_Frequency", DbType.Int64, N(DTO.RNN_Frequency));
            db.AddInParameter(cmd, "@RNN_Particulars", DbType.String, DTO.RNN_Particulars ?? "");
            db.AddInParameter(cmd, "@DeleteNumbers", DbType.String, DTO.DeleteNumbers ?? "");
            db.AddInParameter(cmd, "@CreatorCode", DbType.Int32, DTO.CreatorCode);
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            return db.ExecuteDataSet(cmd);
        }
    }
}