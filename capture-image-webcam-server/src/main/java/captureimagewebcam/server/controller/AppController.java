package captureimagewebcam.server.controller;

import captureimagewebcam.server.controller.dto.Image;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.List;

@RestController
@RequestMapping("upload")
@Slf4j
@CrossOrigin(origins = "*")
public class AppController implements Serializable {

    static final String corsUrl = "*";

    @PostMapping("dto")
    @ResponseStatus(HttpStatus.OK)
    @SneakyThrows
    public void dtoMode(@RequestBody List<Image> images) {
        for (Image image : images) {
            final byte[] bytes = Base64.decodeBase64(image.getContent());

            //Do something with bytes
            saveFile(bytes);
        }
    }

    @PostMapping(value = "multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @SneakyThrows
    public void multipartMode(@RequestBody MultipartFile[] files) {
        for (MultipartFile file : files) {
            final byte[] bytes = Base64.decodeBase64(file.getBytes());

            //Do something with bytes
            saveFile(bytes);
        }
    }

    private void saveFile(byte[] bytes) throws IOException {
        final File tempFile = File.createTempFile(System.currentTimeMillis() + "", ".png");
        try (FileOutputStream fileOutputStream = new FileOutputStream(tempFile)) {
            fileOutputStream.write(bytes);
            log.debug(tempFile.getAbsolutePath());
        }
    }
}
