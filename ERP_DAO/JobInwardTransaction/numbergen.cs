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
    public class CNV_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        public CNV_NextNumber_DTO CNVNextNumberDB(CNV_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("CNV_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@CNVDate", DbType.Date, DTO.CNVDate);
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
                    DTO.FinalCNVNumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
    public class JSO_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        public JSO_NextNumber_DTO JSONextNumberDB(JSO_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JSO_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@JSODate", DbType.Date, DTO.JSODate);
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
                    DTO.FinalJSONumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
    public class JWI_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();
        public JWI_NextNumber_DTO JWINextNumberDB(JWI_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JWI_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@JWIDate", DbType.Date, DTO.JWIDate);
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
                    DTO.FinalJWINumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
    public class DN_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DN_NextNumber_DTO DNNextNumberDB(DN_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("DN_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@DNDate", DbType.Date, DTO.DNDate);
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
                    DTO.FinalDNNumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
    public class RN_GetNextNumberDAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public RN_NextNumber_DTO RNNextNumberDB(RN_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());

            DbCommand cmd =
                db.GetStoredProcCommand("RN_GetNextNumber_SP");

            db.AddInParameter(cmd,
                              "@Id",
                              DbType.Int32,
                              DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@RNDate", DbType.Date, DTO.RNDate);
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
                    DTO.FinalRNNumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }

            return DTO;
        }
 
    }

    public class JIJWI_SVO_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();

        public JIJWI_SVO_NextNumber_DTO JIJWI_SVO_NextNumberDB(JIJWI_SVO_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JIJWI_SVO_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@JIJWI_SVO_Date", DbType.Date, DTO.JIJWI_SVO_Date);
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
                    DTO.FinalNumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }

    public class JIFRT_SVO_NextNumber_DAO
    {
        DBConnect DB = new DBConnect();

        public JIFRT_SVO_NextNumber_DTO JIFRT_SVO_NextNumberDB(JIFRT_SVO_NextNumber_DTO DTO)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JIFRT_SVO_GetNextNumber_SP");
            db.AddInParameter(cmd, "@Id", DbType.Int32, DTO.Id);

            switch (DTO.Id)
            {
                case 101:
                    db.AddInParameter(cmd, "@JIFRT_SVO_Date", DbType.Date, DTO.JIFRT_SVO_Date);
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
                    DTO.FinalNumber = DTO.Prefix + seqStr + DTO.Suffix;
                    break;
            }
            return DTO;
        }
    }
}
